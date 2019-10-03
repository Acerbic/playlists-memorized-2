/**
 * All the stuff to do with long-term persistence (db connection, etc)
 */

import uuid from "uuid/v4";

export interface UserDataGoogle {
    accessToken: any;
    refreshToken: any;
}

export interface UserDataAnonymous {
    createdAt: Date;
}

interface UserRecordBase {
    userId: string;
    type: string;
    data: any;
}

interface UserRecordGoogle extends UserRecordBase {
    type: "google";
    data: UserDataGoogle;
}
interface UserRecordAnonymous extends UserRecordBase {
    type: "anonymous";
    data: UserDataAnonymous;
}

export type UserRecord = UserRecordAnonymous | UserRecordGoogle;

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

export async function add_new_user(
    type: UserRecord["type"],
    data: UserRecord["data"]
): Promise<string> {
    // TODO: STUB:

    // generating new unique user ID
    let userId = uuid();
    let count = 10;
    while (--count > 0 && storage.has(userId)) {
        userId = uuid();
    }
    if (count <= 0) {
        return Promise.reject(new Error("Failed to create a new ID for user"));
    }

    storage.set(userId, <UserRecord>{ userId, data, type });
    return Promise.resolve(userId);
}
