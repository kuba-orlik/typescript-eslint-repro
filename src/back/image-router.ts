import { KoaResponsiveImageRouter } from "koa-responsive-image-router";
import { IMAGE_CACHE_FS_DIR, SMARTCROP_CACHE_FS_DIR } from "./config.js";

export const RESPONSIVE_IMAGES_URL_PATH = "/images";

export const imageRouter = new KoaResponsiveImageRouter({
	staticPath: RESPONSIVE_IMAGES_URL_PATH,
	thumbnailSize: 20,
	cacheManagerResolutionThreshold: 50,
	imageStoragePath: IMAGE_CACHE_FS_DIR,
	smartCropStoragePath: SMARTCROP_CACHE_FS_DIR,
});
