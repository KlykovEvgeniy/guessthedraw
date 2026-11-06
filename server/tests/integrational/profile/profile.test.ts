//@ts-nocheck
import { app, server } from '../../../src';
import { User } from '../../../src/database';
import request from "supertest";
import mongoose from 'mongoose';
import jsonwebtoken from 'jsonwebtoken';

describe("GET - /api/v1.0.0/auth/profile", () => {
    let mockCookie: string;
    let userId: string;

    const testUser = {
        email: "profile_test@gmail.com",
        username: "ProfileRunner",
        password: "hashedPassword123" 
    };

    beforeAll(async () => {
        const createdUser = await User.create({
            email: testUser.email,
            username: testUser.username,
            password: testUser.password,
            isSubmitted: false
        });
        
        userId = createdUser._id.toString();

        const secret = process.env.ACCESS_TOKEN || 'fallback_secret';
        const token = jsonwebtoken.sign(
            { id: userId, username: testUser.username },
            secret,
            { expiresIn: '1h' }
        );

        mockCookie = `token=${token};`;
    });

    afterAll(async () => {
        await User.deleteOne({ _id: userId });
        server.close();
        await mongoose.disconnect();
    });

    test("Should successfully return user profile when valid 'token' cookie is provided", async () => {
        const response = await request(app)
            .get("/api/v1.0.0/auth/profile")
            .set("Cookie", [mockCookie]); 

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("success", true);
        expect(response.body.data.user.email).toBe(testUser.email);
        expect(response.body.data.user.username).toBe(testUser.username);
        
        expect(response.body.data.user.password).toBeUndefined();
    });

    test("Should return 401 Unauthorized if 'token' cookie is missing", async () => {
        const response = await request(app)
            .get("/api/v1.0.0/auth/profile");

        expect(response.status).toBe(401);
    });

    test("Should return 401 Unauthorized if 'token' cookie is mutated/invalid", async () => {
        const invalidCookie = "token=completely_fake_jwt_string_12345; HttpOnly;";
        
        const response = await request(app)
            .get("/api/v1.0.0/auth/profile")
            .set("Cookie", [invalidCookie]);

        expect(response.status).toBe(401);
    });
});
