// DO NOT EDIT! This file is generated automaticaly with npm run generate-routes

import Router from "@koa/router";
import { mount } from "@sealcode/sealgen";
import * as URLs from "./urls";

import { default as Hello } from "./hello.page";

export default function mountAutoRoutes(router: Router) {
	mount(router, URLs.HelloURL, Hello);
}
