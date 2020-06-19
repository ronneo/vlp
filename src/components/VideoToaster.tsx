import { Position, Toaster } from "@blueprintjs/core";
 
/** Singleton toaster instance. Create separate instances for different options. */
export const VideoToaster = Toaster.create({
    className: "video-toaster",
    position: Position.TOP,
});