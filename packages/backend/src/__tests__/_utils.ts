/**
 * Not tests themselves, but reusable utility functions to build / execute tests
 */

import { Profile } from "passport-google-oauth20";
import { User } from "../models/User";

// reusable template of profile
export const mock_user_profile: Profile = {
    id: "mock-id-google-profile",
    provider: "google",
    profileUrl: "",
    _json: "",
    _raw: "",
    displayName: "Mock User",
};

export const mock_user: User = {
    id: "mock-id-user",
    authentications: {
        GOOGLE: {
            id: "mock-id-auth",
            auth_id: mock_user_profile.id,
            type: "GOOGLE",
            extra: {
                accessToken: "mock access token",
                refreshToken: "mock refresh token",
                profile: mock_user_profile,
            },
        },
    },
};
