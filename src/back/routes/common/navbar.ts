import { BaseContext } from "koa";

export default function navbar(ctx: BaseContext) {
	return /* HTML */ ` <nav>
		<a href="/" style="display: flex; align-items: center">
			<img
				src="/assets/logo"
				alt="${ctx.$app.manifest.name} - logo"
				width="50"
				height="50"
			/>
			Sealious Playground
		</a>
		<ul>
			<li><a href="/account/create">Register</a></li>
		</ul>
	</nav>`;
}
