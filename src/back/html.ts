import { Context } from "sealious";

export default async function html(
	context: Context,
	body: string
): Promise<string> {
	return /* HTML */ `<!DOCTYPE html>
		<html>
			<head>
				<script src="/dist/bundle.js"></script>
			</head>
			<link href="/style.css" rel="stylesheet" type="text/css" />
			${body}
		</html>`;
}
