import { Request, Response, Handler } from "express";
import asyncHandler from "express-async-handler";
import passport from "passport";

import { google } from "googleapis";

import { BaseAPIResponse } from "../routes";
import { UserRecord, update_user_record } from "../storage";
import { TokenInfo, Credentials } from "google-auth-library";

export const MALFORMED_SESSION_TOKEN = "MALFORMED_SESSION_TOKEN";
export const EXPIRED_SESSION_TOKEN = "EXPIRED_SESSION_TOKEN";

export type ValidateSessionResponseBody = BaseAPIResponse;

export default <Array<Handler>>[
    passport.authenticate("jwt", { session: false }),
    asyncHandler(async function(req: Request, res: Response) {
        try {
            const user = req.user as UserRecord;
            switch (user.type) {
                case "anonymous":
                    throw "Anonymous sessions not supported";
                case "google":
                    // we don't need any specific google access, just using
                    // Google OAuth to keep track of identity of user

                    const oauth2Client = new google.auth.OAuth2(
                        process.env.GOOGLE_CLIENT_ID,
                        process.env.GOOGLE_CLIENT_SECRET
                    );

                    oauth2Client.on("tokens", tokens => {
                        if (tokens.refresh_token) {
                            user.refreshToken = tokens.refresh_token;
                        }

                        user.accessToken = tokens.access_token;
                        // store the refresh_token in my database!
                        update_user_record(user);
                    });

                    // get info on existing access token, including expiry date
                    const credentials: Credentials = {
                        access_token: user.accessToken,
                        refresh_token: user.refreshToken,
                    };
                    try {
                        const info = await oauth2Client.getTokenInfo(
                            user.accessToken
                        );
                        // this one in milliseconds!
                        credentials.expiry_date = info.expiry_date;
                    } catch (ex) {
                        if (ex.message === "invalid_token") {
                            credentials.access_token = undefined;
                        } else {
                            throw ex; // unknown exception
                        }
                    }
                    oauth2Client.setCredentials(credentials);

                    // ensure access token is up to date, updating it if needed
                    await oauth2Client.getAccessToken();

                    break;
                default:
                    // unknown or empty type: error
                    throw "Unknown session type";
            }

            res.json(<BaseAPIResponse>{
                success: true,
            });
        } catch (err) {
            res.status(400);
            res.json(<BaseAPIResponse>{
                success: false,
                errorMsg:
                    typeof err === "object"
                        ? (err as Error).message
                        : String(err),
                errorCode: MALFORMED_SESSION_TOKEN,
            });
        }
    }),
];
