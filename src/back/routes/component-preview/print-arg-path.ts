export function printArgPath(path: string[]): string {
	return path.map((e) => `[${e}]`).join("");
}
