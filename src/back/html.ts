export default function html(body: string): string {
	return /* HTML */ `<!DOCTYPE html>
		<html>
			<link href="/style.css" rel="stylesheet" type="text/css" />
			${body}
			<script src="/dist/bundle.js"></script>
		</html>`;
}
