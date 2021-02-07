export default function html(body: string): string {
	return /* HTML */ `<!DOCTYPE html>
		<html>
			<head>
				<script src="/dist/bundle.js"></script>
			</head>
			<link href="/style.css" rel="stylesheet" type="text/css" />
			${body}
		</html>`;
}
