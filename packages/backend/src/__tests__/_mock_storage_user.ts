import uuid from "uuid/v4";

import { AuthType } from "../../generated/prisma-client";
import {
    DbStorage,
    UserNotFoundError,
    AllAuthTypes,
} from "../contracts/DbStorage";
import { User, UserAuthType } from "../models/User";
import { mock_user_profile } from "./_utils";

export class MockStorageUsers implements Partial<DbStorage> {
    private _storage: Map<string, User> = new Map();
    private _storage_by_auth: Map<string, User> = new Map();

    // sync version of get_user
    _get_user(id: string) {
        if (this._storage.has(id)) {
            return this._storage.get(id) as User;
        }
        throw new UserNotFoundError();
    }

    get_user: jest.MockedFunction<DbStorage["get_user"]> = jest.fn(async id =>
        this._get_user(id)
    );

    _find_user_by_auth(authType: AuthType, authId: string) {
        const u = this._storage_by_auth.get(authId);
        if (
            !u ||
            !u.authentications[authType] ||
            u.authentications[authType]!.authId !== authId
        ) {
            throw new UserNotFoundError();
        }
        return u;
    }
    find_user_by_auth: jest.MockedFunction<
        DbStorage["find_user_by_auth"]
    > = jest.fn(async (authType, authId) =>
        this._find_user_by_auth(authType, authId)
    );

    _add_new_user(userData: any, auths: Omit<UserAuthType, "id">[]) {
        const user_id = uuid();
        const user: User = {
            id: user_id,
            authentications: {},
        };
        const auth_ids: string[] = [];
        auths.forEach(auth => {
            if (AllAuthTypes.includes(auth.type)) {
                const auth_id = uuid();
                user.authentications[auth.type] = Object.assign({}, auth, {
                    id: auth_id,
                });
                auth_ids.push(auth_id);
            }
        });
        this._storage.set(user_id, user);
        auth_ids.forEach(auth_id => this._storage_by_auth.set(auth_id, user));
        return user_id;
    }
    add_new_user: jest.MockedFunction<DbStorage["add_new_user"]> = jest.fn(
        async (userData, auths) => this._add_new_user(userData, auths)
    );

    update_user_record: jest.MockedFunction<
        DbStorage["update_user_record"]
    > = jest.fn();
}

export class MockSingleUserStorage extends MockStorageUsers {
    single_user_id: string;
    constructor() {
        super();

        this.single_user_id = this._add_new_user({}, [
            {
                type: "GOOGLE",
                authId: mock_user_profile.id,
                extra: {
                    accessToken: "mock_access_token",
                    refreshToken: "mock_refresh_token",
                    profile: mock_user_profile,
                },
            },
        ]);
    }
}
