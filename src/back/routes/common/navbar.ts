import { BaseContext } from "koa";
import { SignUpURL, SignInURL, TodoURL, LogoutURL } from "../urls.js";

export default async function navbar(ctx: BaseContext) {
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
