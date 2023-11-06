import { Context } from "koa";
import {
	Form,
	FormData,
	FormDataValue,
	Fields,
	Controls,
	FormReaction,
} from "@sealcode/sealgen";
import html from "../html";
import { Users } from "../collections/collections";
import { FlatTemplatable, tempstream } from "tempstream";
import { PageErrorMessage } from "@sealcode/sealgen/@types/page/mountable-with-fields";

export const actionName = "SignIn";

const fields = {
	username: new Fields.SimpleFormField(true),
	password: new Fields.SimpleFormField(true),
};

export const SignInShape = Fields.fieldsToShape(fields);

export default new (class SignInForm extends Form<typeof fields, void> {
	defaultSuccessMessage = "Formularz wypełniony poprawnie";
	fields = fields;

	controls = [
		new Controls.SimpleInput(fields.username, { label: "Username:", type: "text" }),
		new Controls.SimpleInput(fields.password, {
			label: "Password:",
			type: "password",
		}),
	];

	async validateValues(
		ctx: Context,
		data: Record<string, FormDataValue>
	): Promise<{ valid: boolean; error: string }> {
		const { parsed: username } = await this.fields.username.getValue(ctx, data);

		const filter: object = typeof username === "string" ? { username } : {};

		const user = await Users.suList().filter(filter).fetch();

		if (user.empty) {
			return { valid: false, error: `Incorrect password or username` };
		}

		return { valid: true, error: `` };
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async canAccess(ctx: Context) {
		if (ctx.$context.session_id) {
			return { canAccess: false, message: "" };
		}
		return { canAccess: true, message: "" };
	}

	async onSuccess(
		_: Context,
		__: FormData<string>,
		_submitResult: void
	): Promise<FormReaction> {
		const reaction: FormReaction = {
			action: "redirect",
			url: "/",
		};
		console.log("Successfully logged in.");
		return reaction;
	}

	async onError(
		ctx: Context,
		data: FormData<string>,
		error: unknown
	): Promise<FormReaction> {
		const reaction: FormReaction = {
			action: "stay",
			content: this.render(ctx, data, true),
			messages: [
				{
					type: "error",
					text: `There was an error while logging in: ${String(error)}`,
				},
			],
		};
		return reaction;
	}

	async onSubmit(ctx: Context, data: FormData) {
		try {
			const sessionId: string = await Users.app.collections.sessions.login(
				data.raw_values.username as string,
				data.raw_values.password as string
			);

			ctx.cookies.set("sealious-session", sessionId, {
				maxAge: 1000 * 60 * 60 * 24 * 7,
				secure: ctx.request.protocol === "https",
				overwrite: true,
			});
		} catch (error) {
			throw new Error(String(error));
		}
		return;
	}

	async renderError(ctx: Context, error: PageErrorMessage): Promise<FlatTemplatable> {
		return html(ctx, "SignIn", `${error.message}`);
	}

	async render(ctx: Context, data: FormData, show_field_errors: boolean) {
		return html(
			ctx,
			"SignIn",
			tempstream`${await super.render(ctx, data, show_field_errors)}`
		);
	}
})();
