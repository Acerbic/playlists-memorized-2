/**
 * Handles session-related activities - tokens exchanged with the frontend.
 */
import jwt from "jsonwebtoken";
import { Profile } from "passport-google-oauth20";
import Joi from "@hapi/joi";

import { UserRecordGoogle, UserRecord } from "./storage";

interface BaseSession {
    type: string;
    // In-app user id
    userId: string;
    // issued at - added automatically by JWT to payload
    iat?: number;
    // expires at - added by JWT to payload
    exp?: number;
}

export interface AuthorizedGoogleSession extends BaseSession {
    type: "google";
    // Google data
    userGoogleId: string;
    profile: Profile;
}

export interface AnonymousSession extends BaseSession {
    type: "anonymous";
}

export interface LoginTokenSession extends BaseSession {
    type: "login-token";
}

export type UserSession =
    | AuthorizedGoogleSession
    | AnonymousSession
    | LoginTokenSession;

/**
 * Get Session object from JWT token string, provides basic validation
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

            // checking basic compliance with BaseSession signature
            const schema = Joi.object({
                type: Joi.string()
                    .required()
                    .min(1),
                userId: Joi.string()
                    .required()
                    .min(1),
            });
            const validation = schema.unknown(true).validate(session);
            if (validation.error) {
                reject(validation.error);
            } else {
                resolve(session as UserSession);
            }
        });
    });
}

/**
 * Turn user session object into JWT string
 * @param session
 */
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

/**
 * Create a temporary token for transition during authorization.
 * This token expires in 60 seconds.
 */
export async function create_temporary_auth_token({
    userId,
}: UserRecord): Promise<string> {
    const session: LoginTokenSession = {
        type: "login-token",
        userId,
    };
    return jwt.sign(session, process.env.JWT_SECRET!, {
        expiresIn: 60,
    });
}

/**
 * Creates a long-term authorized token for existing user
 */
export async function create_user_session_token({
    type,
    userId,
    profile,
}: UserRecordGoogle): Promise<string> {
    // FIXME: currently bound to Google session ? Rework for generalization
    // might be needed
    const user_session: AuthorizedGoogleSession = {
        type,
        userId,
        profile,
        userGoogleId: profile.id,
    };
    return sign_session(user_session);
}
