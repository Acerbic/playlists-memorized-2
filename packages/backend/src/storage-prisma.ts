/**
 * Prisma implementation of DbStorage contract.
 */

import { prisma, User, Prisma, AuthType } from "../generated/prisma-client";
import { BaseClientOptions } from "prisma-client-lib";

import {
    DbStorage,
    UserRecord,
    UserAuthType,
    AllAuthTypes,
    UserNotFoundError,
} from "./storage";

/**
 * Convert GraphQL fragment into UserRecord object
 */
type UserFragment = Array<Partial<User> & { auths: Array<UserAuthType> }>;
function userFragmentToUserRecord(f: UserFragment): UserRecord {
    if (f.length < 1) {
        throw new UserNotFoundError();
    }

    const firstRecord = f[0];

    if (!firstRecord.id) {
        throw new Error("UserFragment must contain `id` field");
    }

    const result: UserRecord = {
        id: firstRecord.id!,
        authentications: {},
    };

    firstRecord.auths.forEach(auth => {
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

    async get_user(userId: string): Promise<UserRecord> {
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

        return this.prisma
            .users({ where: { id: userId } })
            .$fragment<UserFragment>(fragment)
            .then(userFragmentToUserRecord);
    }

    async find_user_by_auth(
        type: AuthType,
        authId: string
    ): Promise<UserRecord> {
        if (!AllAuthTypes.includes(type)) {
            throw new Error("Unknown authorization type");
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

        return this.prisma
            .userAuths({ where: { authId, type }, first: 1 })
            .$fragment<Array<{ user: any }>>(fragment)
            .then(fr_result => userFragmentToUserRecord([fr_result[0].user]));
    }

    async add_new_user(
        userData: Omit<User, "id">,
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
                auths: { create: authenticationsFiltered },
            })
            .then(user => {
                return user.id;
            });
    }

    async update_user_record({
        id,
        authentications,
        ...data
    }: UserRecord): Promise<void> {
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
}
