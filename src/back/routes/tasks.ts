import Router from "@koa/router";
import { Middlewares } from "sealious";
import { MainView } from "./homepage";

const router = new Router();

router.post(
	"/",
	Middlewares.extractContext(),
	Middlewares.parseBody(),
	async (ctx) => {
		await ctx.$app.collections.tasks
			.make({
				title: ctx.$body.title as string,
				done: false,
				is_active: false,
			})
			.save(ctx.$context);
		ctx.body = await MainView(ctx.$context);
	}
);

router.delete("/:task_id", Middlewares.extractContext(), async (ctx) => {
	const task = await ctx.$app.collections.tasks.getByID(
		ctx.$context,
		ctx.params.task_id
	);
	await task.remove(ctx.$context);
	ctx.body = await MainView(ctx.$context);
});

export default router;
