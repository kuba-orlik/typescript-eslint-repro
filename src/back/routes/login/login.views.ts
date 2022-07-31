import input from "../common/ui/input";

export function LoginForm(username = "", error_message = ""): string {
	let error_username = "";
	let error_password = "";
	if (error_message === "Incorrect username!") error_username = error_message;
	else error_password = error_message;
	return /* HTML */ `
		<turbo-frame id="login">
			<h2>Zaloguj</h2>
			<form method="POST" action="/login" data-turbo-frame="_top">
				<label for="username">
					${input({
						name: "username",
						id: "username",
						value: username,
						type: "text",
						required: true,
						label: "Nazwa użytkownika:",
						error: error_username,
					})}
				</label>
				<label for="password">
					${input({
						id: "password",
						name: "password",
						type: "password",
						required: true,
						label: "Hasło:",
						error: error_password,
					})}
				</label>
				<input type="submit" value="Zaloguj" />
			</form>
		</turbo-frame>
	`;
}
