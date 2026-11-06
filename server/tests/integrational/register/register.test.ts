// @ts-nocheck
import { app, server } from '../../../src';
import { User, TokenModel } from '../../../src/database';
import request from "supertest"
import mongoose from 'mongoose';

describe("POST - /api/v1.0.0/auth/register", () => {
    const payload = {
        email: "tG8znbAIaAsPPVSmVMry@gmail.com",
        username: "A652DpM9PxuOt4CZy0gF",
        password: "syypqmO7u5QSH1nlPhy9",
    };
    afterEach(async () => {
        const user = await User.findOne({ email: "tG8znbAIaAsPPVSmVMry@gmail.com" });
        if (user) {
            await User.deleteOne({ email: "tG8znbAIaAsPPVSmVMry@gmail.com" });
            await TokenModel.deleteOne({ user: user.id });
            console.log("tG8znbAIaAsPPVSmVMry@gmail.com and token cleared");
        }
    });
    afterAll(async () => {
        server.close();
        await mongoose.disconnect();
    });
    test('Should register new user and contain refresh-cookie token in cookies', async () => {
        const response = await request(app).post("/api/v1.0.0/auth/register").send(payload);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("data");
        expect(response.body.data.user.email).toBe(payload.email);
        expect(response.body.data.tokens).toHaveProperty('access');
        expect(response.body.data.user.isSubmitted).toBe(false);

        const cookies = response.headers["set-cookie"] as unknown as string[] | undefined;
        expect(cookies).toBeDefined();
        if (cookies) {
            const hasRefreshToken = cookies.some((c) => c.startsWith("token="));
            expect(hasRefreshToken).toBe(true);
            const isHttpOnly = cookies.some((c) => c.includes("HttpOnly"));
            expect(isHttpOnly).toBe(true);
        }
    });
    test("Should give errors after create a user with same username and email", async () => {
        const payload = {
            email: "tG8znbAIaAsPPVSmVMry@gmail.com",
            username: "A652DpM9PxuOt4CZy0gF",
            password: "syypqmO7u5QSH1nlPhy9",
        };
        const firstResponse = await request(app)
            .post("/api/v1.0.0/auth/register")
            .send(payload);
        expect(firstResponse.status).toBe(201);
        const secondResponse = await request(app)
            .post("/api/v1.0.0/auth/register")
            .send(payload);
        expect(secondResponse.status).toBe(400);
        expect(secondResponse.body).toHaveProperty("message");
        expect(secondResponse.body.message).toContain("is already taken");
    });
    test("Should return 400 if email format is invalid", async () => {
        const invalidPayload = {
            email: "broken-email-format",
            username: "validUsername123",
            password: "ValidPassword123!"
        };

        const response = await request(app)
            .post("/api/v1.0.0/auth/register")
            .send(invalidPayload);

        expect(response.status).toBe(400);
    });

    test("Should NOT return password field in the response body", async () => {
        const response = await request(app)
            .post("/api/v1.0.0/auth/register")
            .send(payload);

        expect(response.status).toBe(201);
        expect(response.body.data.user.password).toBeUndefined();
    });
    test("Should fail if username is taken but email is unique", async () => {
        await request(app).post("/api/v1.0.0/auth/register").send(payload);
        const secondResponse = await request(app)
            .post("/api/v1.0.0/auth/register")
            .send({
                email: "completely_new_email@gmail.com",
                username: payload.username,
                password: "SomePassword123!"
            });

        expect(secondResponse.status).toBe(400);
        expect(secondResponse.body.message).toContain("is already taken");
    });

})
