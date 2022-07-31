// DO NOT EDIT! This file is generated automaticaly with npm run generate-routes

import Router from "@koa/router";
import { Middlewares } from "sealious";

import { default as TestComplex } from "./test-complex.form";
import { default as MyProfile } from "./users/me.page";

export const TestComplexURL = "/test-complex/";
export const MyProfileURL = "/users/me/";

export default function mountAutoRoutes(router: Router) {
	router.use(TestComplexURL, Middlewares.extractContext(), Middlewares.parseBody());
	TestComplex.mount(router, TestComplexURL);

	router.use(MyProfileURL, Middlewares.extractContext(), Middlewares.parseBody());
	MyProfile.mount(router, MyProfileURL);
}
