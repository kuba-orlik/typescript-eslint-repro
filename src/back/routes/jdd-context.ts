import { simpleJDDContext, JDDContext } from "@sealcode/jdd";
import { imageRouter } from "../image-router.js";

export const jdd_context = {
	...simpleJDDContext,
	render_image: async (image_id, args) => {
		if (!image_id) {
			return "";
		}
		const image_pointer = await simpleJDDContext.decode_file(image_id);
		if (!image_pointer) {
			return "";
		}
		return imageRouter.image(image_pointer.path, args);
	},
} as JDDContext;
