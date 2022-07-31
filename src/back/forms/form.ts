import { BaseContext } from "koa";
import Router from "@koa/router";
import { Templatable, tempstream } from "tempstream";
import { FormControl } from "./controls";
import { hasShape, is, predicates } from "@sealcode/ts-predicates";
import { Mountable, PageErrorMessage } from "../page/page";
import { FormField } from "./field";

export type FormData<Fieldnames extends string = string> = {
	values: Record<Fieldnames, string | string[] | number>;
	raw_values: Record<Fieldnames, string | string[] | number>;
	errors: Partial<Record<Fieldnames, string>>;
	messages: { type: "info" | "success" | "error"; text: string }[];
};

export default abstract class Form<Fieldnames extends string = string>
	implements Mountable
{
	abstract fields: FormField<Fieldnames>[];
	abstract controls: FormControl[];
	defaultSuccessMessage = "Done";
	submitButtonText = "Wyslij";

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async canAccess(_: BaseContext) {
		return { canAccess: true, message: "" };
	}

	async renderError(_: BaseContext, error: PageErrorMessage) {
		return tempstream/* HTML */ `<div>${error.message}</div>`;
	}

	async validate(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_: BaseContext,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		__: Record<string, unknown>
	): Promise<{ valid: boolean; error: string }> {
		return {
			valid: true,
			error: "",
		};
	}

	private async _validate(
		ctx: BaseContext,
		values: Record<string, unknown>
	): Promise<{
		valid: boolean;
		errors: Record<Fieldnames | "form", string>;
	}> {
		// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
		const errors = {} as Record<Fieldnames | "form", string>;
		let valid = true;
		await Promise.all(
			this.fields.map(async (field) => {
				const { valid: fieldvalid, message: fieldmessage } =
					await field._validate(ctx, values[field.name]);
				if (!fieldvalid) {
					valid = false;
					errors[field.name] = fieldmessage;
				}
			})
		);
		const formValidationResult = await this.validate(ctx, values);
		if (!formValidationResult.valid) {
			valid = false;
			errors.form = formValidationResult.error;
		}
		return { valid, errors };
	}

	async render(
		ctx: BaseContext,
		data: FormData,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		form_path: string
	): Promise<Templatable> {
		return tempstream/* HTML */ `${this.makeFormTag(`${ctx.URL.pathname}/`)} ${
			!this.controls.some((control) => control.role == "messages")
				? this.renderMessages(ctx, data)
				: ""
		} ${
			data.errors.form !== undefined
				? `<div class="form__error">${data.errors.form}</div>`
				: ""
		} ${this.renderControls(ctx, data)}<input type="submit" value="${
			this.submitButtonText
		}"/></form>`;
	}

	public renderMessages(_: BaseContext, data: FormData): Templatable {
		return tempstream/* HTML */ `<div class="form-messages">
			${data.messages.map(
				(message) =>
					`<div class="form-message form-message--${message.type}">${message.text}</div>`
			)}
		</div>`;
	}

	public renderControls(ctx: BaseContext, data: FormData): Templatable {
		return tempstream/* HTML */ `${this.controls.map((control) =>
			control.render(ctx, this.fields, data)
		)}`;
	}

	public makeFormTag(path: string) {
		return `<form method="POST" action="${path}">`;
	}

	private generateData(rawData: Record<string, unknown> = {}): FormData {
		// generates a FormData object that has the correct shape to be passed to
		// render(), so for example it makes sure that all fields either have values or
		// are empty string (the aren't undefined, for example). If no argument is passed,
		// creates an object that represents an empty state of the form. If some data
		// object is passed in the first argument, then the values in that data object are
		// incorporated into the generated object

		// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
		const values = Object.fromEntries(
			this.fields.map((f) => [f.name, rawData[f.name] || f.getEmptyValue()])
		) as Record<Fieldnames, string>;
		// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
		const errors = Object.fromEntries(this.fields.map((f) => [f.name, ""])) as Record<
			Fieldnames,
			string
		>;
		return {
			values,
			errors,
			messages: [],
			// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
			raw_values: rawData as Record<string, string>,
		};
	}

	public async onValuesInvalid(
		ctx: BaseContext,
		errors: Record<Fieldnames, string>,
		form_path: string
	) {
		ctx.status = 422;
		const { values, raw_values } = this.generateData(ctx.$body);
		ctx.body = await this.render(
			ctx,
			{
				values,
				raw_values,
				errors,
				messages: [{ type: "error", text: "Some fields are invalid" }],
			},
			form_path
		);
	}

	public async onError(ctx: BaseContext, error: unknown, form_path: string) {
		ctx.status = 422;
		let error_message = "Unknown error has occured";
		if (
			is(error, predicates.object) &&
			hasShape({ message: predicates.string }, error)
		) {
			error_message = error.message;
		}
		const { values, raw_values } = this.generateData(ctx.$body);
		ctx.body = await this.render(
			ctx,
			{
				values,
				raw_values,
				errors: {},
				messages: [{ type: "error", text: error_message }],
			},
			form_path
		);
	}

	public abstract onSubmit(
		ctx: BaseContext,
		values: Record<Fieldnames, string | string[] | number>
	): void | Promise<void>;

	public async onSuccess(ctx: BaseContext, form_path: string): Promise<void> {
		const { values, raw_values } = this.generateData(ctx.$body);
		ctx.body = await this.render(
			ctx,
			{
				values,
				raw_values,
				errors: {},
				messages: [{ type: "success", text: this.defaultSuccessMessage }],
			},
			form_path
		);
		ctx.status = 422;
	}

	public mount(router: Router, path: string) {
		router.use(path, async (ctx, next) => {
			const result = await this.canAccess(ctx);
			if (!result.canAccess) {
				ctx.body = this.renderError(ctx, {
					type: "access",
					message: result.message,
				});
				ctx.status = 403;
				return;
			}
			await next();
		});
		router.get(path, async (ctx) => {
			ctx.type = "html";
			ctx.body = await this.render(ctx, this.generateData(), path);
		});
		router.post(path, async (ctx) => {
			const { valid, errors } = await this._validate(ctx, ctx.$body);
			if (!valid) {
				await this.onValuesInvalid(ctx, errors, path);
				return;
			}
			try {
				await this.onSubmit(ctx, this.generateData(ctx.$body).values);
				await this.onSuccess(ctx, path);
			} catch (e) {
				// eslint-disable-next-line no-console
				console.dir(e, { depth: 5 });
				await this.onError(ctx, e, path);
			}
		});
	}
}
