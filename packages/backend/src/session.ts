/**
 * Handles session-related activities
 */
import jwt from "jsonwebtoken";
import { Profile } from "passport-google-oauth20";

import { UserRecordGoogle, UserRecord } from "./storage";

interface BaseSession {
    type: string;
    // In-app user id
    userId: string;
}

export interface AuthorizedGoogleSession extends BaseSession {
    type: "google";
    // Google data
    profile: Profile;
}

export interface AnonymousSession extends BaseSession {
    type: "anonymous";
}

export type UserSession = AuthorizedGoogleSession | AnonymousSession;

/**
 * Check JWT token to be a valid operational session descriptor
 */
export async function decode_session_token(
    token: string
): Promise<UserSession> {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET!, (err, session) => {
            if (err) {
                reject(err);
                return;
            }

            if (typeof session !== "object") {
                reject(new Error("Token string was not decoded into object"));
                return;
            }

            resolve(session as UserSession);
        });
    });
}

export async function sign_session(session: UserSession): Promise<string> {
    return new Promise((resolve, reject) => {
        jwt.sign(session, process.env.JWT_SECRET!, (err, encoded) => {
            if (err) {
                reject(err);
            } else {
                resolve(encoded);
            }
        });
    });
}

export async function create_temporary_auth_token({ userId }: UserRecord) {
    return jwt.sign({ userId }, process.env.JWT_SECRET!, {
        expiresIn: 60,
    });
}

export async function create_user_session_token({
    type,
    userId,
    profile,
}: UserRecordGoogle): Promise<string> {
    const user_session: AuthorizedGoogleSession = {
        type,
        userId,
        profile,
    };
    return sign_session(user_session);
}
