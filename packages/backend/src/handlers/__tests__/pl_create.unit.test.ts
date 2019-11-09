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
    // it("should be able to create entry for given playlist url", async () => {
    //     const req = new Request("/pl/create", { method: "POST" });
    //     (req as any).body = <PlaylistCreateRequest>{
    //         url: "https://google.com",
    //     };
    //     req.app.set("pl-controller", new MockPlaylistController_MockSource());
    //     const res = new Response();
    //     const next = jest.fn();

    //     await route(req as any, res as any, next);

    //     expect(next).not.toBeCalled();
    //     expect(res.end).not.toBeCalled();
    //     expect(res.json).toBeCalledTimes(1);
    //     const expected_body: PlaylistCreateResponse = {
    //         success: true,
    //         playlist: {
    //             data: "playlist data",
    //         },
    //     };
    //     expect(res.json.mock.calls[0][0]).toStrictEqual(expected_body);
    // });
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
        async (sourceString: string): Promise<Playlist> => {
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
                    return { data: "snapshot data" } as any;
                });
            })();
        }
    );
}
