// @ts-nocheck
import { app, server } from '../../../src';
import { User, TokenModel } from '../../../src/database';
import request from "supertest";
import mongoose from 'mongoose';
import bcrypt from "bcrypt";

describe("POST - /api/v1.0.0/auth/login", () => {
    const rawPassword = "securePassword123";
    const testUser = {
        email: "login_test@gmail.com",
        username: "LoginRunner",
        password: rawPassword,
    };

    beforeAll(async () => {
        const hashedPassword = await bcrypt.hash(rawPassword, 10);
        await User.create({
            email: testUser.email,
            username: testUser.username,
            password: hashedPassword,
            isSubmitted: false
        });
    });

    afterAll(async () => {
        const user = await User.findOne({ email: testUser.email });
        if (user) {
            await User.deleteOne({ email: testUser.email });
            await TokenModel.deleteOne({ user: user.id });
            console.log("ogin_test@gmail.com and token cleared");
        }
        server.close();
        await mongoose.disconnect();
    });

    test("Should login successfully, return access token and set 'token' cookie", async () => {
        const response = await request(app)
            .post("/api/v1.0.0/auth/login")
            .send({
                email: testUser.email,
                password: testUser.password
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data.user.email).toBe(testUser.email);
        expect(response.body.data.tokens).toHaveProperty('access');

        const cookies = response.headers["set-cookie"] as unknown as string[] | undefined;
        expect(cookies).toBeDefined();
        if (cookies) {
            const hasTokenCookie = cookies.some((c) => c.startsWith("token="));
            expect(hasTokenCookie).toBe(true);
            const isHttpOnly = cookies.some((c) => c.includes("HttpOnly"));
            expect(isHttpOnly).toBe(true);
        }
    });

    test("Should return 400 bad request for incorrect password", async () => {
        const response = await request(app)
            .post("/api/v1.0.0/auth/login")
            .send({
                email: testUser.email,
                password: "wrong_password_here"
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    test("Should return 400 if user with such email does not exist", async () => {
        const response = await request(app)
            .post("/api/v1.0.0/auth/login")
            .send({
                email: "not_existing_email_123@gmail.com",
                password: testUser.password
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });
});
