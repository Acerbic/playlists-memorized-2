/**
 * Data object to describe user entity
 */

import {
    User as UserPrisma,
    UserAuth,
    AuthType,
} from "../../generated/prisma-client";
import { Profile } from "passport-google-oauth20";

export interface UserGoogleAuth extends UserAuth {
    type: "GOOGLE";
    extra: {
        accessToken: string;
        refreshToken: string;
        profile: Profile;
    };
}

// all allowed auth types, unlike UserAuth which is a general case
export type UserAuthType = UserGoogleAuth; // | UserFacebookAuth | ....

export interface User extends UserPrisma {
    authentications: Partial<Record<AuthType, UserAuthType>>;
}

export default User;
