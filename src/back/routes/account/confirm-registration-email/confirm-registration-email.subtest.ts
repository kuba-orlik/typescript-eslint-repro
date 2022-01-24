import axios from "axios";
import assert from "assert";
import { TestUtils } from "sealious";
import { withProdApp } from "../../../test_utils/with-prod-app";

describe("account-creation-details", () => {
	it("throws when no token/email is present", () =>
		withProdApp(({ base_url }) =>
			TestUtils.assertThrowsAsync(
				async () => {
					await axios.get(`${base_url}/account-creation-details`);
				},
				async function () {}
			)
		));
	it("displays an html form after the positive flow", () =>
		withProdApp(async ({ base_url }) => {
			const resp = await axios.get(
				`${base_url}/account-creation-details?token=oieajgoiea&email=ababab@ok.pl`
			);
			assert.deepEqual(resp.status, 200);
			assert(resp.data.length);
		}));
});
