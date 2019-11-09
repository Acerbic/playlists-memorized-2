import { Snapshot as PrismaSnapshot } from "../../generated/prisma-client";

export interface Snapshot extends PrismaSnapshot {
    playlistId: string;
}

export default Snapshot;
