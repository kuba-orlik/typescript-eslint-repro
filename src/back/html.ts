import { Context } from "sealious";

export default async function html(
	_context: Context,
	body: string
): Promise<string> {
	return /* HTML */ `<!DOCTYPE html>
		<html>
			<head>
				<meta name="viewport" content="width=device-width" />
				<script src="/dist/bundle.js"></script>
			</head>
			<link href="/style.css" rel="stylesheet" type="text/css" />
			${body}
		</html>`;
}
