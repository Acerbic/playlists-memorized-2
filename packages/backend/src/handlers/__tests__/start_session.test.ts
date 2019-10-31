import request from "supertest";
import jwt from "jsonwebtoken";

interface StorageModule {
    get_user: jest.Mock;
    get_user_by_auth: jest.Mock;
    add_new_user: jest.Mock;
    find_or_create_google_user: jest.Mock;
    reset_users_storage: jest.Mock;
    update_user_record: jest.Mock;
}

const mock_storage: Map<string, UserRecord> = new Map();
let mock_storage_module: StorageModule & { __esModule: true };
jest.mock("../../storage", () => {
    mock_storage_module = {
        __esModule: true,
        get_user: jest.fn(),
        get_user_by_auth: jest.fn(),
        add_new_user: jest.fn(),
        find_or_create_google_user: jest.fn(),
        reset_users_storage: jest.fn(),
        update_user_record: jest.fn(),
    };
    return mock_storage_module;
});

import makeApp from "../../app";
const app = makeApp();

import { create_temporary_auth_token } from "../../session";

import { mock_user_profile } from "../../__tests__/_utils";
import { UserRecord } from "../../storage";

describe("route /start_session", () => {
    afterEach(() => {
        mock_storage_module.add_new_user.mockReset();
        mock_storage_module.get_user_by_auth.mockReset();
        mock_storage_module.add_new_user.mockReset();
        mock_storage_module.find_or_create_google_user.mockReset();
        mock_storage_module.reset_users_storage.mockReset();
        mock_storage_module.update_user_record.mockReset();
    });
    it("should fail if no Authorization header", () =>
        request(app)
            .get("/start_session")
            .expect(401));
    it("should fail if Authorization header is not a valid JWT", () =>
        request(app)
            .get("/start_session")
            .set("Authorization", "Bearer 123123123123")
            .expect(401));

    it("should fail if authorization token is outdated", async () => {
        const at_signed = jwt.sign({}, process.env.JWT_SECRET!, {
            expiresIn: -60,
        });
        return request(app)
            .get("/start_session")
            .set("Authorization", "Bearer " + at_signed)
            .expect(401);
    });

    it("should return JSON response with a session token, in exchange for a good auth token", async () => {
        const record: UserRecord = {
            id: "123",
            auth: {
                GOOGLE: {
                    id: "234",
                    authId: mock_user_profile.id,
                    type: "GOOGLE",
                    extra: {
                        accessToken: "mock token",
                        refreshToken: "mock token",
                        profile: mock_user_profile,
                    },
                },
            },
        };
        mock_storage.set(record.id!, record);
        mock_storage_module.get_user.mockImplementationOnce(async id => {
            if (mock_storage.has(id)) {
                return mock_storage.get(id);
            }
            throw new Error("no user");
        });

        const at_signed = await create_temporary_auth_token(record);
        return request(app)
            .get("/start_session")
            .set("Authorization", "Bearer " + at_signed)
            .expect(200);
    });
});
