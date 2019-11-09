/**
 * Playlist controller implementation
 */

import { APIError } from "./routes";
import { PlaylistController } from "./contracts/PlaylistController";
import { PlaylistSource } from "./contracts/PlaylistSource";

export class PlaylistControllerImpl implements PlaylistController {
    private pl_url_detectors: PlaylistSource[] = [];

    constructor() {
        this.pl_url_detectors = [
            // TODO:
        ];
    }

    async detectSource(sourceString: string) {
        const source = this.pl_url_detectors.find(
            async s => await s.detect(sourceString)
        );
        if (source) {
            return source;
        } else {
            throw new APIError("Playlist source not recognized", sourceString);
        }
    }
}
