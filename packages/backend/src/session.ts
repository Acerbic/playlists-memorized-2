/**
 * Handles session-related activities
 */
import jwt from "jsonwebtoken";
import uuid from "uuid/v4";

export interface AuthorizedGoogleSession {
    type: "google";
    // In-app user id
    userId: string;
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
    const sessionPromise: Promise<UserSession> = new Promise(
        (resolve, reject) => {
            jwt.verify(token, process.env.JWT_SECRET!, (err, session) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (typeof session !== "object") {
                    reject(
                        new Error("Token string was not decoded into object")
                    );
                    return;
                }

                resolve(session as UserSession);
            });
        }
    );

    // const session: UserSession = await sessionPromise;
    // const userId = session.userId;
    // TODO:
    // check storage to confirm that this userId session is not stale
    // for anonymous user, check session expiration date
    // for google authenticated user, check with the google services that
    //      access tokens are still valid (update possibly)
    // switch (session.type) {
    //     case "anonymous":
    //     case "google":
    //     default:
    //         // unknown or empty type: error
    //         return;
    // }

    return sessionPromise;
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
