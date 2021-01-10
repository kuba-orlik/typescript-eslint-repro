export default function html(body: string): string {
	return /* HTML */ `<!DOCTYPE html>
		<html>
			<link href="/style.css" rel="stylesheet" type="text/css" />
			${body}
			<script type="module">
				import hotwiredTurbo from "https://cdn.skypack.dev/@hotwired/turbo";
			</script>
			<script src="/bundle.js"></script>
		</html>`;
}
