import { withProdApp } from "../../test_utils/with-prod-app";

describe("login", () => {
	it("displays login form", async () => {
		return withProdApp(async ({ rest_api }) => {
			const result = await rest_api.get("/logowanie");
			const usernameStructure = `
			<label for="username">Nazwa użytkownika:</label>
			<input 
				id="username" 
				type="text" 
				name="username" 
				value="" 
				placeholder="text" 
				required />`;
			const passwordStructure = `
			<label for="password">Hasło:</label>
			<input 
				id="password" 
				type="password" 
				name="password" 
				value="" 
				placeholder="password" 
				required />`;

			if (
				!(
					result
						.replace(/\s/g, "")
						.includes(usernameStructure.replace(/\s/g, "")) &&
					result
						.replace(/\s/g, "")
						.includes(passwordStructure.replace(/\s/g, ""))
				)
			)
				throw new Error("Bad html structure!");
		});
	});
});
