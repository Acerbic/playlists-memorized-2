/**
 * Create a new playlist entry from URL
 */
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";

import { SuccessAPIResponse, APIError } from "../../routes";
import { PlaylistController } from "../../contracts/PlaylistController";
import { DbStorage } from "../../contracts/DbStorage";

export interface PlaylistCreateRequest {
    url: string;
}

export interface PlaylistCreateResponse extends SuccessAPIResponse {
    playlist: any;
}

export default asyncHandler(async function(req: Request, res: Response) {
    if (typeof req.body !== "object") {
        throw new APIError(`Malformed or missing field "url" in request body.`);
    }

    const source_str = (req.body as PlaylistCreateRequest).url;

    const source = await (req.app.get(
        "pl-controller"
    ) as PlaylistController).detectSource(source_str);

    if (!(await source.confirm(source_str))) {
        throw new APIError(`Can't resolve given URL to a playlist`);
    }

    const playlist = await source.fetch(source_str);
    // await (req.app.get("storage") as DbStorage).add_new_playlist(
    //     req.user,
    //     source_str,
    //     playlist
    // );

    const response: PlaylistCreateResponse = {
        success: true,
        playlist,
    };
    res.json(response);
});
