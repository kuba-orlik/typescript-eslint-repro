import { BaseContext } from "koa";
import qs from "qs";

export async function sleep(time: number) {
	return new Promise((resolve) => setTimeout(resolve, time));
}

export type Awaited<T> = T extends Promise<infer U> ? U : T;
export type UnwrapArray<T> = T extends Array<infer U> ? U : T;

export function* naturalNumbers(min: number, max: number) {
	for (let i = min; i <= max; i++) {
		yield i;
	}
}

export function UrlWithNewParams(
	ctx: BaseContext,
	query_params: Record<string, unknown>
): string {
	return `${ctx.path}?${qs.stringify(query_params)}`;
}
