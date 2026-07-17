import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('=== PASSPORT BOOT LOG ===');
console.log('GOOGLE_CLIENT_ID length:', process.env.GOOGLE_CLIENT_ID?.length || 'missing');
console.log('GOOGLE_CLIENT_ID begins with:', process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.substring(0, 5) : 'N/A');
console.log('=========================');


// Usually, in a pure JWT setup without sessions, we don't strictly *need* serialize/deserialize,
// except passport sometimes expects it or uses it to pass the user object.
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID?.trim() || 'dummy_client_id',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET?.trim() || 'dummy_secret',
            callbackURL: '/api/auth/google/callback',
            proxy: true,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user already exists
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    return done(null, user);
                }

                // If not, we check if a user exists with the same email
                user = await User.findOne({ email: profile.emails[0].value });

                if (user) {
                    // Link google account to existing email
                    user.googleId = profile.id;
                    if (!user.avatar && profile.photos && profile.photos.length > 0) {
                        user.avatar = profile.photos[0].value;
                    }
                    await user.save();
                    return done(null, user);
                }

                // Otherwise, create a new user entirely
                user = await User.create({
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : ''
                });

                return done(null, user);
            } catch (err) {
                console.error('[Passport Setup] Error:', err);
                return done(err, null);
            }
        }
    )
);

export default passport;
