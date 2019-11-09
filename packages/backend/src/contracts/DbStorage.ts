/**
 * All the stuff to do with long-term persistence (db connection, etc)
 */

import { User as UserPrisma, AuthType } from "../../generated/prisma-client";
import { User, UserAuthType } from "../models/User";
import { Playlist } from "../models/Playlist";

// error type to reject with when user is not found in storage
export class UserNotFoundError extends Error {}

// all possible authentication types, as array - must be equivalent to AuthType
// enum values
export const AllAuthTypes: readonly AuthType[] = Object.freeze(["GOOGLE"]);

export interface DbStorage {
    /**
     * Find an existing user by id
     * If user with this id is not found, rejects with UserNotFoundError
     * @param userId - id of user in storage
     */
    get_user: (userId: string) => Promise<User>;

    /**
     * If user with this id is not found, rejects with UserNotFoundError
     */
    find_user_by_auth: (type: AuthType, authId: string) => Promise<User>;

    /**
     * Creates a new user in app storage based on authentication data.
     * @returns id of created user
     */
    add_new_user: (
        userData: Omit<UserPrisma, "id">,
        authentications: Omit<UserAuthType, "id">[]
    ) => Promise<string>;

    update_user_record: (user: User) => Promise<void>;

    add_new_playlist(
        user: User,
        sourceString: string,
        playlist: Playlist
    ): Promise<void>;
}
