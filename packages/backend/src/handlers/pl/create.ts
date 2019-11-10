/**
 * Create a new playlist entry from URL
 */
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";

import { SuccessAPIResponse, APIError } from "../../routes";
import { PlaylistController } from "../../contracts/PlaylistController";
import { DbStorage } from "../../contracts/DbStorage";
import { Playlist } from "../../models/Playlist";
import { Snapshot } from "../../models/Snapshot";
import { User } from "../../models/User";

export interface PlaylistCreateRequest {
    url: string;
}

export interface PlaylistCreateResponse extends SuccessAPIResponse {
    playlist: Playlist;
    snapshot: Snapshot;
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

    const { source_id, title, tracks } = await source.fetch(source_str);

    const storage = req.app.get("storage") as DbStorage;
    const snapshot_id = await storage.add_new_playlist(
        req.user as User,
        source.type,
        source_id,
        title,
        tracks
    );
    const snapshot: Snapshot = await storage.get_snapshot(snapshot_id);
    const playlist: Playlist = await storage.get_playlist(snapshot.playlistId);

    const response: PlaylistCreateResponse = {
        success: true,
        playlist,
        snapshot,
    };
    res.json(response);
});
