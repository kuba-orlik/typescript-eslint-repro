import { is, predicates } from "@sealcode/ts-predicates";
import { BaseContext } from "koa";
import { Templatable, tempstream } from "tempstream";
import { ChekboxedListField, FormField, PickFromListField } from "./field";
import Form, { FormData } from "./form";
import { FormFieldsList } from "./form-fields-list";

export abstract class FormControl {
	abstract render(
		ctx: BaseContext,
		formFields: FormField[],
		data: FormData
	): Templatable | Promise<Templatable>;
	abstract role: "input" | "decoration" | "messages" | "submit";
}

export class FormHeader extends FormControl {
	role = <const>"decoration";
	constructor(
		public text: string,
		public isVisible: (ctx: BaseContext) => Promise<boolean> = async () => true
	) {
		super();
	}
	async render(ctx: BaseContext) {
		const isVsbl = await this.isVisible(ctx);
		return isVsbl ? `<h2>${this.text}</h2>` : "";
	}
}

export class FormParagraph extends FormControl {
	role = <const>"decoration";
	constructor(public text: string) {
		super();
	}
	render() {
		return `<p>${this.text}</p>`;
	}
}

export abstract class FormFieldControl extends FormControl {
	role = <const>"input";
	constructor(public fieldnames: string[]) {
		super();
	}

	areFieldNamesValid(fields: FormField[]) {
		return this.fieldnames.every((fieldname) =>
			fields.some((f) => f.name == fieldname)
		);
	}

	abstract _render(
		ctx: BaseContext,
		fields: FormField[],
		data: FormData
	): Templatable | Promise<Templatable>;

	render(
		ctx: BaseContext,
		fields: FormField[],
		data: FormData
	): Templatable | Promise<Templatable> {
		if (!this.areFieldNamesValid(fields)) {
			throw new Error(
				`Invalid field names given to form control: "${this.fieldnames.join(
					", "
				)}". Allowed fields are: ${fields.map((f) => f.name).join(", ")}`
			);
		}
		return this._render(ctx, fields, data);
	}
}

export class SimpleInput extends FormFieldControl {
	constructor(
		public fieldname: string,
		public options: {
			id?: string;
			label?: string;
			autocomplete?: boolean;
			type?:
				| "color"
				| "date"
				| "email"
				| "file"
				| "month"
				| "number"
				| "password"
				| "search"
				| "tel"
				| "text"
				| "time"
				| "url"
				| "week";
			value?: string;
			placeholder?: string;
			readonly?: boolean;
			step?: number;
		} = {}
	) {
		super([fieldname]);
	}

	_render(_: BaseContext, fields: FormField[], data: FormData) {
		const field = FormFieldsList.getField(fields, this.fieldname);
		if (!field) {
			throw new Error("wrong field name");
		}
		const id = this.options.id || field.name;
		const label = this.options.label || field.name;
		const type = this.options.type || "text";
		// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
		const value = data.values[field.name] as string;
		// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
		const raw_value = data.raw_values[field.name] as string;
		const placeholder = this.options.placeholder || type;
		const readonly = this.options.readonly || false;
		const required = field.required;
		const error = data.errors[field.name];
		return /* HTML */ `<div class="input">
			<label for="${id}">${label}</label>
			<input
				id="${id}"
				type="${type}"
				name="${field.name}"
				value="${value === undefined
					? raw_value == undefined
						? ""
						: raw_value
					: value}"
				placeholder="${placeholder}"
				${readonly ? "readonly" : ""}
				${required ? "required" : ""}
				${!this.options.autocomplete ? `autocomplete="off"` : ""}
				${this.options.step ? `step="${this.options.step}"` : ""}
			/>
			${error ? `<div class="input__error">${error}</div>` : ""}
		</div>`;
	}
}

export class Dropdown extends FormFieldControl {
	constructor(
		public fieldname: string,
		public options: {
			label: string;
			autosubmit?: boolean;
			autocomplete?: boolean;
		} = {
			label: fieldname,
			autosubmit: false,
			autocomplete: true,
		}
	) {
		super([fieldname]);
	}

	areFieldNamesValid(fields: FormField[]) {
		return (
			super.areFieldNamesValid(fields) &&
			FormFieldsList.getField(fields, this.fieldname) instanceof PickFromListField
		);
	}

	_render(ctx: BaseContext, fields: FormField[], data: FormData) {
		// safe to disable this as isValidFieldName takes care of checking if the field is of this type
		// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
		const field = FormFieldsList.getField(
			fields,
			this.fieldname
		) as PickFromListField;
		const picked_value = data.values[field.name] || "";
		const id = field.name;
		return tempstream/* HTML */ `<label for="${id}">${this.options.label}</label
			><select
				name="${this.fieldnames}"
				id="${id}"
				${this.options.autosubmit ? `onchange='this.form.submit()'` : ""}
				${!this.options.autocomplete ? `autocomplete="off"` : ""}
			>
				${Promise.resolve(field.generateOptions(ctx)).then((options) =>
					Object.entries(options).map(
						([value, text]) =>
							`<option value="${value}" ${
								(value || "") == picked_value ? "selected" : ""
							}>${text}</option>`
					)
				)}
			</select>`;
	}
}

export class CheboxedListInput extends FormFieldControl {
	constructor(
		public fieldname: string,
		public options: { label: string } = { label: fieldname }
	) {
		super([fieldname]);
	}

	isValidFieldName(form: Form) {
		return form.fields.some((f) => f.name == this.fieldname);
	}

	async _render(ctx: BaseContext, fields: FormField[], data: FormData) {
		// safe to disable this as isValidFieldName takes care of checking if the field is of this type
		// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
		const field = FormFieldsList.getField(
			fields,
			this.fieldname
		) as ChekboxedListField;
		const pickedValues = data.values[field.name] || "";
		if (!is(pickedValues, predicates.array(predicates.string))) {
			throw new Error("picked values is not an array of strings");
		}
		const [options, isVisible] = await Promise.all([
			field.generateOptions(ctx),
			field.isVisible(ctx),
		]);
		return tempstream/* HTML */ `${isVisible
			? Object.entries(options).map(
					([value, text]) => /* HTML */ `<div>
						<input
							type="checkbox"
							id="${field.name}.${value}"
							name="${field.name}.${value}"
							${pickedValues.includes(value) ? "checked" : ""}
						/>
						<label for="${field.name}.${value}">${text}</label>
					</div>`
			  )
			: ""}`;
	}
}

/**
 * This class will render `turbo-frame` tag so that u can
 * embed other route inside your form. This will require
 * to add value to `data: FormData` (inside your master form
 * render function) with key `Frame.FRAME_PATH_KEY`. Value
 * needs to be url to route that you want to embed. If you
 * this value wont be provided frame will redner empty string.
 * See `src/back/routes/profile/[id].form.ts` for an example.
 */
export class Frame extends FormControl {
	constructor(public src: string) {
		super();
	}

	render(): Templatable | Promise<Templatable> {
		return /* HTML */ `<turbo-frame
			id="contrahents"
			loading="lazy"
			src="${this.src}"
		></turbo-frame>`;
	}
	role = <const>"decoration";
}

/**
 * This control has own forms in it so if you want to use it you
 * probably shouldn't use `await super.render(ctx, data, path)` in
 * render method of you from implementation and you should write
 * your own implementation of this method. See forms that uses
 * this control for reference.
 */
export class EditableCollectionSubset extends FormFieldControl {
	constructor(
		public fieldname: string,
		public actionname: string,
		public listLabel?: string,
		public selectLabel?: string
	) {
		super([fieldname]);
	}

	_render(
		ctx: BaseContext,
		fields: FormField[],
		data: FormData<string>
	): Templatable | Promise<Templatable> {
		// safe to disable this as isValidFieldName takes care of checking if the field is of this type
		// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
		const field = FormFieldsList.getField(
			fields,
			this.fieldname
		) as PickFromListField;
		// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
		const values = data.values[this.fieldname] as string[];

		return tempstream/* HTML */ `<div>
			<ul>
				${Promise.resolve(field.generateOptions(ctx)).then((options) =>
					Object.entries(options)
						.filter(([value]) => values.includes(value))
						.map(
							([value, text]) => /* HTML */ `
								<li>
									<form method="POST" action="${ctx.path}">
										<span>${text}</span>
										<input
											type="hidden"
											name="${this.fieldname}"
											value="${value}"
										/>
										<input
											type="hidden"
											name="${this.actionname}"
											value="list"
										/>
										<input
											type="submit"
											${this.listLabel
												? `value="${this.listLabel}"`
												: ""}
										/>
									</form>
								</li>
							`
						)
				)}
			</ul>
			<form method="POST" action="${ctx.path}">
				<select name="${this.fieldname}">
					${Promise.resolve(field.generateOptions(ctx)).then((options) =>
						Object.entries(options)
							.filter(([value]) => !values.includes(value))
							.map(
								([value, text]) =>
									`<option value="${value}">${text}</option>`
							)
					)}
				</select>
				<input type="hidden" name="${this.actionname}" value="select" />
				<input
					type="submit"
					${this.selectLabel ? `value="${this.selectLabel}"` : ""}
				/>
			</form>
		</div>`;
	}
	role = <const>"input";
}
