/**
 * All the stuff to do with long-term persistence (db connection, etc)
 */

import {
    prisma,
    User,
    UserAuth,
    AuthType,
    Maybe,
    UserAuthCreateInput,
} from "../generated/prisma-client";
import uuid from "uuid/v4";
import { Profile } from "passport-google-oauth20";

export const AllAuthTypes: Array<AuthType> = ["GOOGLE"];

export type OptionalId<T extends { id: any }> = Omit<T, "id"> & {
    id?: Maybe<T["id"]>;
};

export interface UserGoogleAuth extends OptionalId<UserAuth> {
    type: "GOOGLE";
    extra: {
        accessToken: string;
        refreshToken: string;
        profile: Profile;
    };
}

// all allowed auth types, unlike UserAuth which is a general case
export type UserAuthType = UserGoogleAuth; // | UserFacebookAuth | ....

export interface UserRecord extends OptionalId<User> {
    auth: {
        [authName in AuthType]?: UserAuthType;
    };
}

/**
 * Find an existing user by id
 * @param userId
 */
export async function get_user(
    userId: string
): Promise<UserRecord | undefined> {
    const fragment = `
        fragment UserWithAuths on User {
            id
            auths {
                id
                type
                authId
                extra
            }
        }
    `;

    return prisma
        .users({ where: { id: userId } })
        .$fragment<UserFragment>(fragment)
        .then(userFragmentToUserRecord);
}

export async function get_user_by_auth(
    type: AuthType,
    authId: string
): Promise<UserRecord | undefined> {
    if (!AllAuthTypes.includes(type)) {
        throw "Unknown authorization type";
    }

    const fragment = `
        fragment UserFromAuth on UserAuth {
            id
            user {
                id
                auths {
                    id
                    type
                    authId
                    extra
                }
            }
        }
    `;

    return prisma
        .userAuths({ where: { authId, type }, first: 1 })
        .$fragment<Array<{ user: any }>>(fragment)
        .then(fr_result => userFragmentToUserRecord([fr_result[0].user]));
}

/**
 * Creates a new in-app user based on authorization data.
 * @returns string - new user (in-app) id
 */
export async function add_new_user(
    newUser: Omit<UserRecord, "id">
): Promise<string> {
    // TODO:
    // Check that auth for this request is not in use by existing user

    const authentications = AllAuthTypes.map(
        authType => newUser.auth[authType]
    ).filter(x => x) as Array<UserAuthCreateInput>;

    if (authentications.length === 0) {
        throw "User create call requires at least one authorization method!";
    }

    return prisma
        .createUser({
            auths: { create: authentications },
        })
        .then(user => {
            return user.id;
        });
}

export async function find_or_create_google_user(
    accessToken: string,
    refreshToken: string,
    profile: Profile
): Promise<UserRecord> {
    const userRecord = await get_user_by_auth("GOOGLE", profile.id);

    if (userRecord) {
        return userRecord;
    }

    return add_new_user({
        auth: {
            GOOGLE: {
                type: "GOOGLE",
                authId: profile.id,
                extra: {
                    accessToken,
                    refreshToken,
                    profile,
                },
            },
        },
    })
        .then(get_user)
        .then(user => {
            if (typeof user !== "undefined") {
                return user;
            } else {
                throw "Failed to create user";
            }
        });
}

/**
 * Find a record for given Google user profile
 * @param profile - Google user profile
 * @returns UserRecordGoogle - record of existing user or undefined, if no user
 * for this google profile is found
 */
// export async function find_google_user(
//     profile: Profile
// ): Promise<UserRecord | undefined> {
//     // FIXME:
//     return Array.from(storage.values()).find(
//         record => record.type === "google" && record.googleUserId === profile.id
//     ) as UserRecordGoogle | undefined;
// }

/**
 * Mostly for testing - purge all data and clear all users from storage
 */
export async function reset_users_storage() {
    return prisma.deleteManyUserAuths().then(() => prisma.deleteManyUsers());
}

export async function update_user_record(user: UserRecord) {
    // TODO:
    // storage.set(user.userId, user);
}

type UserFragment = Array<Partial<User> & { auths: Array<UserAuthType> }>;
function userFragmentToUserRecord(f: UserFragment): UserRecord | undefined {
    if (f.length < 1) {
        return undefined;
    }

    const firstRecord = f[0];

    const result: UserRecord = {
        id: firstRecord.id,
        auth: {},
    };

    firstRecord.auths.forEach(auth => {
        if (AllAuthTypes.includes(auth.type!)) {
            result.auth[auth.type!] = auth;
        }
    });

    return result;
}
