import mongoose, { Schema, Document } from 'mongoose';

export interface IRefreshToken extends Document {
    user: mongoose.Types.ObjectId;
    token: string;
    createdAt: Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        token: {
            type: String,
            required: true,
            unique: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 30 * 24 * 60 * 60,
        },
    },
    {
        versionKey: false,
    },
);

export const TokenModel = mongoose.model<IRefreshToken>(
    'RefreshToken',
    RefreshTokenSchema,
);
