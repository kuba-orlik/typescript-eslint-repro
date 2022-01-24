import Router from "@koa/router";
import { Middlewares } from "sealious";
import finalizePasswordReset from "./finalize-password-reset";
import confirmPasswordReset from "./confirm-password-reset";
import finalizeRegistrationIntent from "./finalize-registration-intent";
import createRouter from "./create/create.routes";
import { confirmRegistrationRouter } from "./confirm-registration-email/confirm-registration-email.routes";

export const accountsRouter = (router: Router): void => {
	router.post(
		"/account/finalize-registration-intent",
		Middlewares.parseBody,
		finalizeRegistrationIntent
	);

	router.post(
		"/account/finalize-password-reset",
		Middlewares.parseBody,
		finalizePasswordReset
	);

	router.get("/account/confirm-password-reset", confirmPasswordReset);
	createRouter(router);
	confirmRegistrationRouter(router);
};
