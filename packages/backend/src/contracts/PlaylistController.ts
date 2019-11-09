/**
 * Playlist controller
 */

import { PlaylistSource } from "./PlaylistSource";

export interface PlaylistController {
    detectSource(source: string): Promise<PlaylistSource>;
}
