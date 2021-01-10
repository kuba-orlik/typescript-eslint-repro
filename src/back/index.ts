import _locreq from "locreq";
import { resolve } from "path";
import Sealious, {
	App,
	Collection,
	Context,
	FieldTypes,
	Policies,
	Middlewares,
	CollectionItem,
} from "sealious";
import frame from "./frame";
import html from "./html";
const locreq = _locreq(__dirname);

declare module "koa" {
	interface BaseContext {
		$context: Sealious.Context;
		$app: Sealious.App;
		$body: Record<string, unknown>;
	}
}

const app = new (class extends App {
	config = {
		upload_path: locreq.resolve("uploaded_files"),
		datastore_mongo: {
			host: "localhost",
			port: 20723,
			db_name: "sealious-playground",
		},
		email: {
			from_address: "sealious-playground@example.com",
			from_name: "Sealious playground app",
		},
	};
	manifest = {
		name: "Sealious Playground",
		logo: resolve(__dirname, "../assets/logo.png"),
		version: "0.0.1",
		default_language: "en",
		base_url: "localhost:8080",
		admin_email: "admin@example.com",
		colors: {
			primary: "#5294a1",
		},
	};
	collections = {
		...App.BaseCollections,
		tasks: new (class extends Collection {
			fields = {
				title: new FieldTypes.Text(),
				done: new FieldTypes.Boolean(),
			};
			defaultPolicy = new Policies.Public();
		})(),
	};
})();

app.start();

const router = app.HTTPServer.router;

function Task(task: CollectionItem<any>) {
	return frame(
		`task-${task.id}`,
		/* HTML */ `<li class="task">
			<input
				type="checkbox"
				data-controller="task"
				data-action="task#toggle"
				data-id="${task.id}"
				${task.get("done") ? "checked" : ""}
			/>
			${task.get("title")}
			<form
				method="DELETE"
				action="/task/${task.id}"
				data-turbo-frame="task-list"
			>
				<input class="delete-button" type="submit" value="🗑" />
			</form>
		</li>`
	);
}

async function TaskList(context: Context) {
	const { items: tasks } = await app.collections.tasks.list(context).fetch();
	return frame(
		"task-list",
		/* HTML */ `
			<ul>
				${tasks.map(Task).join("\n")}
			</ul>
		`
	);
}

function NewTask() {
	return frame(
		"new-task",
		/* HTML */ `<form
			method="POST"
			action="/new-task"
			data-turbo-frame="task-list"
		>
			<input
				id="new-task-title"
				type="text"
				placeholder="write an app"
				name="title"
			/>
			<input type="submit" value="Add" />
		</form>`
	);
}

async function MainView(context: Context) {
	return html(/* HTML */ `<title>My ToDo App</title>
		<body>
			<h1>My ToDo App</h1>
			${await TaskList(context)} ${NewTask()}
		</body>`);
}

router.get("/", Middlewares.extractContext(), async (ctx) => {
	ctx.body = await MainView(ctx.$context);
});

router.post(
	"/new-task",
	Middlewares.extractContext(),
	Middlewares.parseBody(),
	async (ctx) => {
		await app.collections.tasks
			.make({
				title: ctx.$body.title as string,
				done: false,
			})
			.save(ctx.$context);
		ctx.body = await MainView(ctx.$context);
	}
);

router.delete("/task/:task_id", Middlewares.extractContext(), async (ctx) => {
	const task = await app.collections.tasks.getByID(
		ctx.$context,
		ctx.params.task_id
	);
	await task.remove(ctx.$context);
	ctx.body = await MainView(ctx.$context);
});

app.HTTPServer.addStaticRoute("/", locreq.resolve("public"));
