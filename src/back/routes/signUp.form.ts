import { Context } from "koa";
import {
	Form,
	FormData,
	FormDataValue,
	Fields,
	Controls,
	FormReaction,
	fieldsToShape,
} from "@sealcode/sealgen";
import { Users } from "../collections/collections.js";
import html from "../html.js";

export const actionName = "SignUp";

const fields = {
	username: new Fields.CollectionField(true, Users.fields.username),
	email: new Fields.CollectionField(true, Users.fields.email),
	password: new Fields.SimpleFormField(true),
};

export const SignUpShape = fieldsToShape(fields);

export default new (class SignUpForm extends Form<typeof fields, void> {
	defaultSuccessMessage = "Formularz wypełniony poprawnie";
	fields = fields;

	controls = [
		new Controls.SimpleInput(fields.username, { label: "Username:", type: "text" }),
		new Controls.SimpleInput(fields.email, { label: "Email:", type: "email" }),
		new Controls.SimpleInput(fields.password, {
			label: "Password:",
			type: "password",
		}),
	];

	async validateValues(
		ctx: Context,
		data: Record<string, FormDataValue>
	): Promise<{ valid: boolean; error: string }> {
		const { parsed: email } = await this.fields.email.getValue(ctx, data);
		const { parsed: password } = await this.fields.password.getValue(ctx, data);

		if ((password || "").length >= 8) {
			const user = await Users.suList().filter({ email: email }).fetch();
			if (user.empty) {
				return { valid: true, error: `` };
			}
			return { valid: false, error: `Email is arleady taken` };
		} else {
			return {
				valid: false,
				error: "Password must contain a minimum of 8 characters",
			};
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async canAccess(ctx: Context) {
		if (ctx.$context.session_id) {
			return { canAccess: false, message: "" };
		}
		return { canAccess: true, message: "" };
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
					text: `An unexpected error occurred, try again. <br> Error: ${String(
						error
					)}`,
				},
			],
		};
		return reaction;
	}

	async onSuccess(ctx: Context, data: FormData): Promise<FormReaction> {
		const username: FormDataValue = data.raw_values.username;
		const reaction: FormReaction = {
			action: "stay",
			content: `Hello ${String(
				username
			)}. <p class="success-notify">Your account has been successfully created.</p>
					<a href="/" class="nav-logo">
						<img
							src="/assets/logo"
							alt="${ctx.$app.manifest.name} - logo"
							width="50"
							height="50"
						/>
						Sealious App
					</a>`,
			messages: [
				{
					type: "success",
					text: "",
				},
			],
		};

		return reaction;
	}

	async onSubmit(ctx: Context, data: FormData) {
		const username: string =
			typeof data.raw_values.username === "string" ? data.raw_values.username : "";
		const password: string =
			typeof data.raw_values.password === "string" ? data.raw_values.password : "";
		const email: string =
			typeof data.raw_values.email === "string" ? data.raw_values.email : "";

		try {
			await Users.suCreate({
				username: username,
				password: password,
				email: email,
				roles: [],
			});
			// eslint-disable-next-line no-console
			console.log("A user was created successfully.");
		} catch (error) {
			console.error("Error during user creation:", error);
			throw new Error(String(error));
		}
		return;
	}

	async render(ctx: Context, data: FormData, show_field_errors: boolean) {
		return html(ctx, "SignUp", await super.render(ctx, data, show_field_errors));
	}
})();
