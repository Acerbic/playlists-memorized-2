/**
 * All the stuff to do with long-term persistence (db connection, etc)
 */

import {
    User as UserPrisma,
    AuthType,
    PlaylistType,
} from "../../generated/prisma-client";
import { User, UserAuthType } from "../models/User";
import { Playlist } from "../models/Playlist";
import { Snapshot, Track } from "../models/Snapshot";

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

    /**
     * Creates a new playlists or appends a snapshot to an existing one, if this
     * playlist is already known. Attention! Returns id of a Snapshot, not id of
     * the playlist.
     *
     * @param user user for whom this playlist is being added //TODO: many users
     * same playlist fix!
     * @param type source type for the playlist
     * @param sourceId id of the playlist in the given source type
     * @param title title of the playlist
     * @param tracks tracks of the playlist at this moment of time (for a new
     * snapshot)
     * @returns id of a new snapshot if new snapshot was created. id of the
     * last snapshot, if new snapshot is not different from the previous stored
     */
    add_new_playlist(
        user: User,
        type: PlaylistType,
        sourceId: string,
        title: string,
        tracks: Track[]
    ): Promise<string>;

    get_playlist(playlistId: string): Promise<Playlist>;
    get_snapshot(snapshotId: string): Promise<Snapshot>;
}
