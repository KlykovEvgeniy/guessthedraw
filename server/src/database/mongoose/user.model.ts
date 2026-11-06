import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
    {
        username: {
            required: true,
            unique: true,
            type: String,
            minlength: 3,
            maxlength: 20,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            optional: true,
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },
        isSubmitted: {
            type: Boolean,
            default: false,
        },
        submitionLink: {
            type: String,
        },
        avatar: {
            type: String,
            default: 'default-avatar',
        },
        stats: {
            gamePlayed: {
                type: Number,
                default: 0,
            },
            gamesWon: {
                type: Number,
                default: 0,
            },
            score: {
                type: Number,
                default: 0,
            },
        },
        completedGameIds: {
            type: [String],
            default: undefined,
            select: false,
        },
    },
    {
        timestamps: true,
    },
);

export const User = mongoose.model('User', UserSchema);
