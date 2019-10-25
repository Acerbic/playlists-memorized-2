/**
 * All the stuff to do with long-term persistence (db connection, etc)
 */

import uuid from "uuid/v4";
import { Profile } from "passport-google-oauth20";
import { Express } from "express";

interface UserRecordBase extends Express.User {
    userId: string;
    type: string;
}

export interface UserRecordGoogle extends UserRecordBase {
    type: "google";
    googleUserId: string;
    profile: Profile;
    accessToken: any;
    refreshToken: any;
}
interface UserRecordAnonymous extends UserRecordBase {
    type: "anonymous";
    createdAt: Date;
}

export type UserRecord = UserRecordAnonymous | UserRecordGoogle;

// FIXME:
const storage = new Map<string, UserRecord>();

export async function get_user(userId: string): Promise<UserRecord> {
    // TODO: STUB:
    if (
        typeof userId !== "string" ||
        userId.length === 0 ||
        !storage.has(userId)
    ) {
        return Promise.reject(new Error("User with such Id not found"));
    } else {
        return Promise.resolve(storage.get(userId)!);
    }
}

/**
 * Creates a new in-app user based on data,
 * @returns string - new user (in-app) id
 */
export async function add_new_user(
    record:
        | Omit<UserRecordAnonymous, "userId">
        | Omit<UserRecordGoogle, "userId">
): Promise<string> {
    // TODO: STUB:

    // generating new unique user ID
    let userId = uuid();
    let count = 10;
    while (--count > 0 && storage.has(userId)) {
        userId = uuid();
    }
    if (count <= 0) {
        throw new Error("Failed to create a new ID for user");
    }

    switch (record.type) {
        case "anonymous":
            storage.set(userId, {
                userId,
                type: record.type,
                createdAt: new Date("now"),
            });
            break;
        case "google":
            storage.set(userId, {
                userId,
                ...record,
            });
            break;
        default:
            throw new Error("Unknown session type");
    }

    return userId;
}

export async function find_or_create_google_user(
    accessToken: string,
    refreshToken: string,
    profile: Profile
): Promise<UserRecordGoogle> {
    const userRecord = await find_google_user(profile);

    if (userRecord) {
        return userRecord;
    }

    return add_new_user({
        type: "google",
        accessToken,
        refreshToken,
        googleUserId: profile.id,
        profile,
    }).then(get_user) as Promise<UserRecordGoogle>;
}

/**
 * Find a record for given Google user profile
 * @param profile - Google user profile
 * @returns UserRecordGoogle - record of existing user or undefined, if no user
 * for this google profile is found
 */
export async function find_google_user(
    profile: Profile
): Promise<UserRecordGoogle | undefined> {
    // FIXME:
    return Array.from(storage.values()).find(
        record => record.type === "google" && record.googleUserId === profile.id
    ) as UserRecordGoogle | undefined;
}

/**
 * Mostly for testing - purge all data and clear all users from storage
 */
export async function reset_users_storage() {
    // FIXME:
    storage.clear();
}

export async function update_user_record(user: UserRecord) {
    // TODO:
    storage.set(user.userId, user);
}
