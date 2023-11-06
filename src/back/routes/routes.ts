// DO NOT EDIT! This file is generated automaticaly with npm run generate-routes

import Router from "@koa/router";
import { mount } from "@sealcode/sealgen";
import * as URLs from "./urls";

import { default as Hello } from "./hello.page";
import { default as Logout } from "./logout.redirect";
import { default as SignIn } from "./signIn.form";
import { default as SignUp } from "./signUp.form";
import { default as Todo } from "./todo.form";

export default function mountAutoRoutes(router: Router) {
	mount(router, URLs.HelloURL, Hello);
	mount(router, URLs.LogoutURL, Logout);
	mount(router, URLs.SignInURL, SignIn);
	mount(router, URLs.SignUpURL, SignUp);
	mount(router, URLs.TodoURL, Todo);
}
