import { EmailTemplates, Errors } from "sealious";
import TheApp from "../app.js";

export default async function PasswordResetTemplate(
	app: TheApp,
	{ email_address, token }: { email_address: string; token: string }
) {
	const matching_users = await app.collections["users"]
		.suList()
		.filter({ email: email_address })
		.fetch();

	if (!matching_users.items.length) {
		throw new Errors.NotFound("No user with that email");
	}

	const username = matching_users.items[0].get("username");

	return EmailTemplates.Simple(app, {
		subject: app.i18n("password_reset_email_subject", [app.manifest.name]),
		to: `${String(username)}<${email_address}>`,
		text: `
         ${app.i18n("password_reset_email_text", [app.manifest.name, username])}`,
		buttons: [
			{
				text: app.i18n("password_reset_cta"),
				href: `${app.manifest.base_url}/confirm-password-reset?token=${token}&email=${email_address}`,
			},
		],
	});
}
