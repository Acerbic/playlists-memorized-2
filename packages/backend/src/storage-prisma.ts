/**
 * Prisma implementation of DbStorage contract.
 */

import {
    prisma,
    User as PrismaUser,
    Prisma,
    AuthType,
    PlaylistType,
} from "../generated/prisma-client";
import { BaseClientOptions } from "prisma-client-lib";

import {
    DbStorage,
    AllAuthTypes,
    UserNotFoundError,
} from "./contracts/DbStorage";
import { User, UserAuthType } from "./models/User";
import { Playlist } from "./models/Playlist";
import { Snapshot, Track } from "./models/Snapshot";

/**
 * Convert GraphQL fragment into User object
 */
type UserFragment = Array<
    Partial<PrismaUser> & { authentications: Array<UserAuthType> }
>;
function userFragmentToUserRecord(f: UserFragment): User {
    if (f.length < 1) {
        throw new UserNotFoundError();
    }

    const firstRecord = f[0];

    if (!firstRecord.id) {
        throw new Error("UserFragment must contain `id` field");
    }

    const result: User = {
        id: firstRecord.id!,
        authentications: {},
    };

    firstRecord.authentications.forEach(auth => {
        if (AllAuthTypes.includes(auth.type!)) {
            result.authentications[auth.type!] = auth;
        }
    });

    return result;
}

export class StoragePrisma implements DbStorage {
    private prisma: Prisma;

    constructor(options?: BaseClientOptions) {
        // default instance or custom
        this.prisma =
            typeof options !== "undefined" ? new Prisma(options) : prisma;
    }

    async get_user(userId: string): Promise<User> {
        const fragment = `
            fragment UserWithAuths on User {
                id
                authentications {
                    id
                    type
                    auth_id
                    extra
                }
            }
        `;

        return this.prisma
            .users({ where: { id: userId } })
            .$fragment<UserFragment>(fragment)
            .then(userFragmentToUserRecord);
    }

    async find_user_by_auth(type: AuthType, authId: string): Promise<User> {
        if (!AllAuthTypes.includes(type)) {
            throw new Error("Unknown authorization type");
        }

        const fragment = `
            fragment UserFromAuth on UserAuth {
                id
                user {
                    id
                    authentications {
                        id
                        type
                        auth_id
                        extra
                    }
                }
            }
        `;

        return this.prisma
            .userAuths({ where: { auth_id: authId, type }, first: 1 })
            .$fragment<Array<{ user: any }>>(fragment)
            .then(fr_result => userFragmentToUserRecord([fr_result[0].user]));
    }

    async add_new_user(
        userData: Omit<PrismaUser, "id">,
        authentications: Omit<UserAuthType, "id">[]
    ): Promise<string> {
        const authenticationsFiltered = authentications.filter(auth =>
            AllAuthTypes.includes(auth.type)
        );

        if (authentications.length === 0) {
            throw new Error(
                "User create call requires at least one authentication method!"
            );
        }

        return this.prisma
            .createUser({
                ...userData,
                authentications: { create: authenticationsFiltered },
            })
            .then(user => {
                return user.id;
            });
    }

    async update_user_record({
        id,
        authentications,
        ...data
    }: User): Promise<void> {
        // 1: updating user itself.
        await this.prisma.updateUser({
            where: { id },
            data,
        });

        // 2: updating authentication.
        return Promise.all(
            AllAuthTypes.filter(
                authName => typeof authentications[authName] !== "undefined"
            ).map(authName => {
                const { id, ...data } = authentications[authName]!;
                return prisma.updateUserAuth({
                    where: { id },
                    data,
                });
            })
        ).then(() => {}); // discarding array of results
    }

    add_new_playlist(
        user: User,
        type: PlaylistType,
        sourceId: string,
        title: string,
        tracks: Track[]
    ): Promise<string> {
        // TODO:
        throw new Error("Method not implemented.");
    }

    get_playlist(playlistId: string): Promise<Playlist> {
        // TODO:
        throw new Error("Method not implemented.");
    }
    get_snapshot(snapshotId: string): Promise<Snapshot> {
        // TODO:
        throw new Error("Method not implemented.");
    }
}
