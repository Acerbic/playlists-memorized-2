/**
 * Snapshot is a state of the playlist in a specific moment of time
 */

import { Snapshot as PrismaSnapshot } from "../../generated/prisma-client";

export interface Snapshot extends PrismaSnapshot {
    playlistId: string;
    data: Track[];
}

/**
 * Metadata of a single track (atomic entity) of a playlist
 */
export interface Track {
    /**
     * A canonical way to identify a track in a playlist
     */
    urlOrId: string;
    title: string;
    /**
     * Length in seconds
     */
    length: number;
}

export default Snapshot;
