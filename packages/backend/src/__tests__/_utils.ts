/**
 * Not tests themselves, but reusable utility functions to build / execute tests
 */

import { Profile } from "passport-google-oauth20";

// reusable template of profile
export const mock_user_profile: Profile = {
    id: "some id",
    provider: "google",
    profileUrl: "",
    _json: "",
    _raw: "",
    displayName: "Mock User",
};
