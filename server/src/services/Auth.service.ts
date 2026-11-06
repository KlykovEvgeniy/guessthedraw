import {
    User,
    RegisterInput,
    RegisterSchema,
    LoginInput,
    LoginSchema,
    TokenModel,
} from '../database';
import { generateTokens } from '../lib';
import MailService from './Mail.service';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

class AuthService {
    async register(data: RegisterInput) {
        try {
            const { email, password, username, avatar } = data;
            const user = await User.findOne({ email });
            if (user) throw new Error(`${email} is already taken`);
            const name = await User.findOne({ username });
            if (name) throw new Error(`${username} is already taken`);
            const hashedPassword = await bcrypt.hash(password, 10);
            const submitionLink = crypto.randomBytes(32).toString('hex');
            const newUser = new User({
                email,
                username,
                password: hashedPassword,
                avatar: '/public/default-avatar.jpg',
                submitionLink,
            });
            const tokens = generateTokens({
                email,
                id: newUser.id,
            });
            const refresh = new TokenModel({
                user: newUser.id,
                token: tokens.refresh,
            });
            try {
                await MailService.sendActivationMail(email, username, submitionLink);
            } catch (error) {
                const mailError = error instanceof Error
                    ? error
                    : new Error('Unable to send the account activation email');
                (mailError as Error & { status?: number }).status = 503;
                throw mailError;
            }
            await newUser.save();
            await refresh.save();
            return {
                user: newUser,
                tokens,
            };
        } catch (error) {
            throw error;
        }
    }
    async activate(activationToken: string) {
        const user = await User.findOne({ submitionLink: activationToken });
        if (!user) {
            throw new Error('Invalid or expired activation link');
        }
        user.isSubmitted = true;
        user.submitionLink = undefined;
        await user.save();
        return user;
    }

    async login(data: LoginInput) {
        try {
            const user = await User.findOne({ email: data.email });
            if (!user) {
                throw new Error('Invalid email or password');
            };
            if (!user.password) {
                throw new Error('Invalid email or password');
            };
            const checkPassword = await bcrypt.compare(data.password, user.password);
            if (!checkPassword) {
                throw new Error('Invalid email or password');
            }
            const tokens = await TokenModel.findOne({ user: user.id });
            if (tokens) {
                await TokenModel.deleteOne({ user: tokens.user });
            }
            const newTokens = generateTokens({
                email: data.email,
                id: user.id,
            });
            const refresh = new TokenModel({
                user: user.id,
                token: newTokens.refresh,
            });
            await refresh.save();
            return {
                user,
                tokens: newTokens,
            }
        } catch (error) {
            throw error;
        }   
    }
}

export const { register, activate, login } = new AuthService();
