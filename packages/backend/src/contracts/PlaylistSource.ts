import { PlaylistType } from "../../generated/prisma-client";
import { Track } from "../models/Snapshot";

export interface PlaylistSourceFetchResult {
    source_id: string;
    title: string;
    tracks: Track[];
}

/**
 * Adapter of a playlist source - Youtube, Spotify, etc.
 */
export interface PlaylistSource {
    type: PlaylistType;

    /**
     * Tries to quickly determine if sourceString is belonging to this
     * PlaylistSource.
     * @returns id of a playlist within this playlist source, if successful.
     *          returns false if sourceString doesn't belong to this source.
     */
    detect(sourceString: string): Promise<string | false>;
    confirm(sourceString: string): Promise<boolean>;

    // TODO: some standardized presentation of playlist or a snapshop, before
    // they are actually stored in the system
    fetch(sourceString: string): Promise<PlaylistSourceFetchResult>;
}
