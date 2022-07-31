import { BaseContext } from "koa";
import { Collection, CollectionItem } from "sealious";
import { Templatable, tempstream } from "tempstream";
import { peopleWhoCan } from "./access-control";
import { naturalNumbers, UrlWithNewParams } from "../util";
import { Page } from "./page";
import { predicates, ShapeToType } from "@sealcode/ts-predicates";
import { PagePropsParser } from "./props-parser";
import { FormFieldControl } from "../forms/controls";
import { FormField } from "../forms/field";
import { FormData } from "../forms/form";
import { FormFieldsList } from "../forms/form-fields-list";

export const BasePagePropsShape = <const>{};
export type BasePageProps = ShapeToType<typeof BasePagePropsShape>;

export const BaseListPagePropsShape = <const>{
	page: predicates.number,
	itemsPerPage: predicates.number,
};
export type BaseListPageProps = ShapeToType<typeof BaseListPagePropsShape>;
export const BaseListPageDefaultProps = { page: 1, itemsPerPage: 25 };

export type PropsErrors<PropsType> = Partial<Record<keyof PropsType, string>>;

export abstract class ListPage<
	ItemType,
	PropsType extends BaseListPageProps = BaseListPageProps
> extends Page {
	abstract getItems(ctx: BaseContext, props: PropsType): Promise<{ items: ItemType[] }>;
	abstract getTotalPages(ctx: BaseContext, props: PropsType): Promise<number>;
	abstract renderItem(ctx: BaseContext, item: ItemType): Promise<Templatable>;
	abstract propsParser: PagePropsParser<PropsType>;

	filterFields: FormField<keyof PropsType>[] = [];
	filterControls: FormFieldControl[] = [];

	renderListContainer(_: BaseContext, content: Templatable): Templatable {
		return tempstream`<div>${content}</div>`;
	}

	async validateProps(
		ctx: BaseContext,
		props: PropsType
	): Promise<{ valid: boolean; errors: PropsErrors<PropsType> }> {
		const errors: PropsErrors<PropsType> = {};
		let has_errors = false;
		const promises = [];
		for (const [key, value] of Object.entries(props)) {
			const field = FormFieldsList.getField(this.filterFields, key);
			if (field) {
				promises.push(
					field._validate(ctx, value).then(({ valid, message }) => {
						if (!valid) {
							has_errors = true;
							// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
							errors[key as keyof PropsType] = message;
						}
					})
				);
			}
		}
		await Promise.all(promises);
		return { valid: has_errors, errors };
	}

	async getProps(ctx: BaseContext): Promise<{
		parsed_props: PropsType;
		errors: PropsErrors<PropsType>;
		raw_props: PropsType;
	}> {
		const raw_props = this.propsParser.decode(ctx);
		const parsed_props = { ...raw_props };
		const { errors } = await this.validateProps(ctx, parsed_props);
		for (const prop_name in errors) {
			const default_value = this.propsParser.getDefaultValue(prop_name);
			if (default_value !== undefined) {
				parsed_props[prop_name] = default_value;
			} else {
				delete parsed_props[prop_name];
			}
		}
		return { parsed_props, errors, raw_props };
	}

	async render(ctx: BaseContext) {
		const { parsed_props, errors, raw_props } = await this.getProps(ctx);

		return tempstream`${this.renderPagination(ctx, parsed_props)}
${this.renderFilters(ctx, parsed_props, raw_props, errors)}
${this.getItems(ctx, parsed_props).then(({ items }) =>
	this.renderListContainer(
		ctx,
		items.map((item) => this.renderItem(ctx, item))
	)
)}`;
	}

	async renderPagination(ctx: BaseContext, props: PropsType) {
		const totalIems = await this.getTotalPages(ctx, props);
		const currentPage = props.page;

		return tempstream/* HTML */ `<center>
			${currentPage > 1 ? this.renderPageButton(ctx, 1, "Pierwsza strona") : ""}
			${currentPage > 1
				? this.renderPageButton(ctx, currentPage - 1, "Poprzednia strona")
				: ""}

			<select onchange="if (this.value) Turbo.visit(this.value)">
				${Array.from(naturalNumbers(1, await this.getTotalPages(ctx, props))).map(
					(n) => /* HTML */ `<option
						value="${UrlWithNewParams(
							ctx,
							//eslint-disable-next-line @typescript-eslint/consistent-type-assertions
							this.propsParser.overwriteProp(ctx, {
								page: n,
							} as Partial<PropsType>)
						)}"
						${currentPage === n ? "selected" : ""}
					>
						${n}
					</option>`
				)}
			</select>
			${currentPage < totalIems
				? this.renderPageButton(ctx, currentPage + 1, "Następna strona")
				: ""}
			${currentPage < totalIems
				? this.renderPageButton(ctx, totalIems, "Ostatnia strona")
				: ""}
		</center>`;
	}

	private renderPageButton(ctx: BaseContext, page: number, text: string) {
		return /* HTML */ `<a
			href="${UrlWithNewParams(
				ctx,
				//eslint-disable-next-line @typescript-eslint/consistent-type-assertions
				this.propsParser.overwriteProp(ctx, {
					page,
				} as Partial<PropsType>)
			)}"
			>${text}</a
		>`;
	}

	renderFilters(
		ctx: BaseContext,
		parsed_props: PropsType, // parsed props don't include wrong values
		raw_props: PropsType,
		errors: PropsErrors<PropsType>
	) {
		return tempstream/* HTML */ `<form method="GET">
			${this.propsParser.makeHiddenInputs(parsed_props, [
				"page",
				...this.filterFields.map((f) => f.name),
			])}
			${this.filterControls.map((control) =>
				// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
				control.render(ctx, this.filterFields, {
					values: parsed_props,
					raw_values: raw_props,
					errors,
					messages: [],
				} as FormData)
			)}
		</form>`;
	}
}

export abstract class SealiousItemListPage<
	C extends Collection,
	PageProps extends BaseListPageProps = BaseListPageProps
> extends ListPage<CollectionItem<C>, PageProps> {
	constructor(public collection: C) {
		super();
	}

	async getTotalPages(ctx: BaseContext, props: PageProps) {
		const { items } = await this.collection.list(ctx.$context).fetch();
		return Math.ceil(items.length / props.itemsPerPage);
	}

	async getItems(ctx: BaseContext, props: PageProps) {
		return {
			items: (
				await this.collection
					.list(ctx.$context)
					.paginate({ items: props.itemsPerPage, page: props.page })
					.fetch()
			).items,
		};
	}

	async renderItem(_: BaseContext, item: CollectionItem<C>): Promise<Templatable> {
		return `<div>${item.id}</div>`;
	}

	canAccess = peopleWhoCan("list", this.collection);
}
