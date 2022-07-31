import { BaseContext } from "koa";

export default async function navbar(ctx: BaseContext) {
	return /* HTML */ ` <nav>
		<a href="/" class="nav-logo">
			<img
				src="/assets/logo"
				alt="${ctx.$app.manifest.name} - logo"
				width="50"
				height="50"
			/>
			Sealious App
		</a>
		<ul>
			<li><a href="/logowanie">Logowanie</a></li>
		</ul>
	</nav>`;
}
