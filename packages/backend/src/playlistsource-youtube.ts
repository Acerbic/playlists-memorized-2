import { PlaylistType } from "../generated/prisma-client";
import { PlaylistSource } from "./contracts/PlaylistSource";
import { Playlist } from "./models/Playlist";

export default class PlaylistSourceYoutube implements PlaylistSource {
    public type: PlaylistType = "YOUTUBE";
    async detect(source: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
    async confirm(source: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    async fetch(source: string): Promise<Playlist> {
        throw new Error("Method not implemented.");
    }
}
