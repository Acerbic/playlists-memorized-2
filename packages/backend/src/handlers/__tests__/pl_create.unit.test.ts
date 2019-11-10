import { Request } from "jest-express/lib/request";
import { Response } from "jest-express/lib/response";

import route, {
    PlaylistCreateRequest,
    PlaylistCreateResponse,
} from "../pl/create";

import { APIError } from "../../routes";
import { PlaylistController } from "../../contracts/PlaylistController";
import { PlaylistSource } from "../../contracts/PlaylistSource";
import { Playlist } from "../../models/Playlist";
import { User } from "../../models/User";
import { mock_user } from "../../__tests__/_utils";
import { DbStorage } from "../../contracts/DbStorage";
import Snapshot from "../../models/Snapshot";

describe("handler for route /pl/create #unit #cold", () => {
    it("should fail if no playlist url is provided", async () => {
        const req = new Request("/pl/create", { method: "POST" });
        const res = new Response();
        const next = jest.fn();

        await route(req as any, res as any, next);

        expect(res.json).not.toBeCalled();
        expect(res.end).not.toBeCalled();
        expect(next).toBeCalled();
        const error = next.mock.calls[0][0];
        expect(error).toBeInstanceOf(APIError);
    });

    it("should fail if source url is invalid url", async () => {
        const req = new Request("/pl/create", { method: "POST" });
        (req as any).body = <PlaylistCreateRequest>{
            url: "httpsPLRZlMhcYkA2Fhwg-NxJewUIgm01o9fzwB",
        };
        req.app.set("pl-controller", new MockPlaylistController_AnyURL());
        const res = new Response();
        const next = jest.fn();

        await route(req as any, res as any, next);

        expect(res.json).not.toBeCalled();
        expect(res.end).not.toBeCalled();
        expect(next).toBeCalled();
        const error = next.mock.calls[0][0];
        expect(error).toBeInstanceOf(APIError);
    });

    it("should fail if source url is not a recognized playlist source", async () => {
        const req = new Request("/pl/create", { method: "POST" });
        (req as any).body = <PlaylistCreateRequest>{
            url: "https://google.com",
        };
        req.app.set("pl-controller", new MockPlaylistController_NotDetected());
        const res = new Response();
        const next = jest.fn();

        await route(req as any, res as any, next);

        expect(res.json).not.toBeCalled();
        expect(res.end).not.toBeCalled();
        expect(next).toBeCalled();
        const error = next.mock.calls[0][0];
        expect(error).toBeInstanceOf(APIError);
    });
    it("should fail if source url is valid but the source has no playlist under given url", async () => {
        const req = new Request("/pl/create", { method: "POST" });
        (req as any).body = <PlaylistCreateRequest>{
            url: "https://google.com",
        };
        req.app.set(
            "pl-controller",
            new MockPlaylistController_SourceCantConfirm()
        );
        const res = new Response();
        const next = jest.fn();

        await route(req as any, res as any, next);

        expect(res.json).not.toBeCalled();
        expect(res.end).not.toBeCalled();
        expect(next).toBeCalled();
        const error = next.mock.calls[0][0];
        expect(error).toBeInstanceOf(APIError);
    });

    it("should fail if there was an error with retrieving playlist", async () => {
        const req = new Request("/pl/create", { method: "POST" });
        (req as any).body = <PlaylistCreateRequest>{
            url: "https://google.com",
        };
        req.app.set(
            "pl-controller",
            new MockPlaylistController_SourceCantFetch()
        );
        const res = new Response();
        const next = jest.fn();

        await route(req as any, res as any, next);

        expect(res.json).not.toBeCalled();
        expect(res.end).not.toBeCalled();
        expect(next).toBeCalled();
        const error = next.mock.calls[0][0];
        expect(error).not.toBeInstanceOf(APIError);
    });

    it("should be able to create entry for given playlist url", async () => {
        const req = new Request("/pl/create", { method: "POST" });
        (req as any).body = <PlaylistCreateRequest>{
            url:
                "https://www.youtube.com/playlist?list=PLcgPzkoC6_LrM_GaWsoRSuL4It2SDpjWk",
        };
        (req as any).user = mock_user;
        req.app.set("pl-controller", new MockPlaylistController_MockSource());
        req.app.set("storage", new MockDbStorage_Playlist());
        const res = new Response();
        const next = jest.fn();

        await route(req as any, res as any, next);

        expect(next).not.toBeCalled();
        expect(res.end).not.toBeCalled();
        expect(res.json).toBeCalledTimes(1);
        const res_body: PlaylistCreateResponse = res.json.mock.calls[0][0];
        expect(res_body).toHaveProperty("success", true);
        expect(res_body).toHaveProperty("playlist");

        expect(res_body.playlist.id).not.toBeFalsy();
        expect(res_body.playlist.snapshotIds.length).toEqual(1);
        expect(res_body.snapshot.id).toEqual(res_body.playlist.snapshotIds[0]);
    });
});

class MockPlaylistSource implements PlaylistSource {
    type = "MOCKSOURCE" as any;
    detect: PlaylistSource["detect"] = jest.fn(
        async (sourceString: string): Promise<string | false> => {
            throw new Error("Method not implemented.");
        }
    );
    confirm: PlaylistSource["confirm"] = jest.fn(
        async (sourceString: string): Promise<boolean> => {
            throw new Error("Method not implemented.");
        }
    );
    fetch: PlaylistSource["fetch"] = jest.fn(
        async (sourceString: string): Promise<any> => {
            throw new Error("Method not implemented.");
        }
    );
}

class MockPlaylistController_NotDetected implements PlaylistController {
    detectSource: PlaylistController["detectSource"] = jest.fn(
        async (sourceString: string): Promise<PlaylistSource> => {
            throw new APIError();
        }
    );
}

class MockPlaylistController_AnyURL implements PlaylistController {
    detectSource: PlaylistController["detectSource"] = jest.fn(
        async (sourceString: string): Promise<PlaylistSource> => {
            try {
                new URL(sourceString);
            } catch (exc) {
                throw new APIError();
            }
            return new MockPlaylistSource();
        }
    );
}

class MockPlaylistController_SourceCantConfirm implements PlaylistController {
    detectSource: PlaylistController["detectSource"] = jest.fn(
        async (sourceString: string): Promise<PlaylistSource> => {
            return new (class extends MockPlaylistSource {
                detect = jest.fn(async () => "id-code");
                confirm = jest.fn(async () => false);
            })();
        }
    );
}

class MockPlaylistController_SourceCantFetch implements PlaylistController {
    detectSource: PlaylistController["detectSource"] = jest.fn(
        async (sourceString: string): Promise<PlaylistSource> => {
            return new (class extends MockPlaylistSource {
                detect = jest.fn(async () => "id-code");
                confirm = jest.fn(async () => true);
                fetch = jest.fn(async () => {
                    throw new Error("uncertain network error");
                });
            })();
        }
    );
}

class MockPlaylistController_MockSource implements PlaylistController {
    detectSource: PlaylistController["detectSource"] = jest.fn(
        async (sourceString: string): Promise<PlaylistSource> => {
            return new (class extends MockPlaylistSource {
                detect = jest.fn(async () => "id-code");
                confirm = jest.fn(async () => true);
                fetch = jest.fn(async () => {
                    return {
                        source_id: "id-code",
                        title: "Playlist title",
                        tracks: [],
                    };
                });
            })();
        }
    );
}

class MockDbStorage_Playlist implements Partial<DbStorage> {
    mock_snapshot: Snapshot = {
        id: "mock-id-snapshot",
        created_at: "12312312",
        title: "Playlist Name",
        playlistId: "mock-id-playlist",
        data: [
            { urlOrId: "track1-id", title: "track1 name", length: 300 },
            { urlOrId: "track2-id", title: "track2 name", length: 300 },
            { urlOrId: "track3-id", title: "track3 name", length: 300 },
        ],
    };
    mock_playlist: Playlist = {
        id: "mock-id-playlist",
        created_at: "12312312",
        modified_at: "12312312",
        title: "Playlist Name",
        source_id: "youtube-playlist-id",
        type: "YOUTUBE",
        snapshotIds: ["mock-id-snapshot"],
    };

    add_new_playlist: jest.MockedFunction<
        DbStorage["add_new_playlist"]
    > = jest.fn(
        async (user, type, sourceId, title, tracks): Promise<string> =>
            "mock-id-snapshot"
    );
    get_snapshot: jest.MockedFunction<DbStorage["get_snapshot"]> = jest.fn(
        async (snapshotId): Promise<Snapshot> => this.mock_snapshot
    );
    get_playlist: jest.MockedFunction<DbStorage["get_playlist"]> = jest.fn(
        async (playlistId): Promise<Playlist> => this.mock_playlist
    );
}
