import { BaseContext } from "koa";
import { ActionName, Collection } from "sealious";

export function peopleWhoCan(action: ActionName, collection: Collection) {
	return async function (ctx: BaseContext) {
		const policy = collection.getPolicy(action);
		const result = await policy.check(ctx.$context);
		if (!result) {
			ctx.status = 403;
			return { canAccess: false, message: "Not allowed" };
		}
		if (!result.allowed) {
			ctx.status = 403;
			return { canAccess: false, message: result.reason };
		}
		return { canAccess: true, message: "" };
	};
}
