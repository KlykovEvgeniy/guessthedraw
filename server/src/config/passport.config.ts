import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../database';
import { config } from 'dotenv';
config();

export function initGooglePassport() {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    }, async (access, refresh, profile, done) => {
        try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
                return done(new Error("No email found in Google profile"), false);
            };
            let user = await User.findOne({ googleId: profile.id });
            if (user) {
                return done(null, user);
            }
            user = await User.findOne({ email });
            if (user) {
                user.googleId = profile.id;
                if (user.avatar === 'default-avatar' && profile.photos?.[0]?.value) {
                    user.avatar = profile.photos[0].value;
                }
                await user.save();
                return done(null, user);
            }
            let username = profile.displayName || `user_${profile.id.substring(0, 5)}`;
            const isUsernameTaken = await User.findOne({ username });
            if (isUsernameTaken) {
                username = `${username}_${Math.floor(100 + Math.random() * 900)}`; 
            }

            user = new User({
                username,
                email,
                googleId: profile.id,
                avatar: profile.photos?.[0]?.value || 'default-avatar',
                isSubmitted: true,
            });

            await user.save();
            return done(null, user);
        } catch (error) {
            return done(error, false);
        }
    }))
};