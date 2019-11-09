/**
 * Playlist entity
 */

import { Playlist as PrismaPlaylist } from "../../generated/prisma-client";

export interface Playlist extends PrismaPlaylist {
    snapshotIds: string[];
}

export default Playlist;
