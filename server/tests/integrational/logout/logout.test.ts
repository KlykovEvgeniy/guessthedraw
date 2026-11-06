//@ts-nocheck
import { app, server } from '../../../src';
import request from "supertest";
import mongoose from 'mongoose';
import jsonwebtoken from 'jsonwebtoken';

describe("POST - /api/v1.0.0/auth/logout", () => {
    let mockCookie: string;

    beforeAll(() => {
        const secret = process.env.ACCESS_TOKEN || 'fallback_secret';
        const token = jsonwebtoken.sign(
            { id: "65f123abc456def789012345", username: "LogoutPlayer" },
            secret,
            { expiresIn: '1h' }
        );
        mockCookie = `token=${token};`;
    });

    afterAll(async () => {
        server.close();
        await mongoose.disconnect();
    });

    test("Should successfully log out and instruct browser to delete 'token' cookie", async () => {
        const response = await request(app)
            .post("/api/v1.0.0/auth/logout")
            .set("Cookie", [mockCookie]);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("success", true);

        const cookies = response.headers["set-cookie"] as unknown as string[] | undefined;
        expect(cookies).toBeDefined();

        if (cookies) {
            const tokenCookie = cookies.find((c) => c.startsWith("token="));
            expect(tokenCookie).toBeDefined();
        }
    });

    test("Should reject logout request with 401 if 'token' cookie is missing", async () => {
        const response = await request(app)
            .post("/api/v1.0.0/auth/logout");
        expect(response.status).toBe(401);
    });
});
