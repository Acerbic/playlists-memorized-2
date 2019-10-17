/**
 * Handles session-related activities
 */
import jwt from "jsonwebtoken";
import uuid from "uuid/v4";

export interface AuthorizedGoogleSession {
    type: "google";
    // In-app user id
    userId: string;
    // Google id;
    userGoogleId: string;
    email?: string;
    name?: string;
}

export interface AnonymousSession {
    type: "anonymous";
    // In-app user id
    userId: string;
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

export async function create_anonymous_session(): Promise<AnonymousSession> {
    //TODO: create record in db for anon sessions

    return Promise.resolve(<AnonymousSession>{
        type: "anonymous",
        userId: uuid(),
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
