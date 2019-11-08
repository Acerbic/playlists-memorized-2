/**
 * All the stuff to do with long-term persistence (db connection, etc)
 */

import { User, UserAuth, AuthType, Maybe } from "../generated/prisma-client";
import { Profile } from "passport-google-oauth20";

// error type to reject with when user is not found in storage
export class UserNotFoundError extends Error {}

// all possible authentication types, as array
export const AllAuthTypes: readonly AuthType[] = Object.freeze(["GOOGLE"]);

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

export interface UserRecord extends User {
    authentications: {
        [authName in AuthType]?: UserAuthType;
    };
}

export interface DbStorage {
    /**
     * Find an existing user by id
     * If user with this id is not found, rejects with UserNotFoundError
     * @param userId - id of user in storage
     */
    get_user: (userId: string) => Promise<UserRecord>;

    /**
     * If user with this id is not found, rejects with UserNotFoundError
     */
    find_user_by_auth: (type: AuthType, authId: string) => Promise<UserRecord>;

    /**
     * Creates a new user in app storage based on authentication data.
     * @returns id of created user
     */
    add_new_user: (
        userData: Omit<User, "id">,
        authentications: Omit<UserAuthType, "id">[]
    ) => Promise<string>;

    update_user_record: (user: UserRecord) => Promise<void>;
}
