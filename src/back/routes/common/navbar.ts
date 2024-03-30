import { BaseContext } from "koa";
import { FlatTemplatable } from "tempstream";
import { SignUpURL, SignInURL, TodoURL, LogoutURL } from "../urls.js";

export async function default_navbar(ctx: BaseContext): Promise<FlatTemplatable> {
	const isLoggedIn = !!ctx.$context.session_id;

	const linkData = isLoggedIn
		? [
				{ text: "Logout", url: LogoutURL },
				{ text: "To do app", url: TodoURL },
		  ]
		: [
				{ text: "Sign in", url: SignInURL },
				{ text: "Sign up", url: SignUpURL },
		  ];

	const linksHTML = linkData
		.map((link) =>
			link.url === new URL(ctx.url, "https://a.com").pathname
				? `<li class="active"><span>${link.text}</span></li>`
				: /* HTML */ `<li><a href="${link.url}">${link.text}</a></li>`
		)
		.join("\n");

	return /* HTML */ ` <nav>
		<a href="/" class="nav-logo">
			<img
				src="/assets/logo"
				alt="${ctx.$app.manifest.name} - logo"
				width="50"
				height="50"
			/>
			${ctx.$app.manifest.name}
		</a>
		<ul>
			${linksHTML}
		</ul>
	</nav>`;
}
