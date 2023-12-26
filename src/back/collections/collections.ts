// DO NOT EDIT! This file is generated automaticaly with 'npm run generate-collections'
import { App } from "sealious";

import _GroupsToUsers from "./groups-to-users.js";
import _Groups from "./groups.js";
import _PasswordResetIntents from "./password-reset-intents.js";
import _Secrets from "./secrets.js";
import _Tasks from "./tasks.js";
import _UserRoles from "./user-roles.js";
import _Users from "./users.js";

export const GroupsToUsers = new _GroupsToUsers();
export const Groups = new _Groups();
export const PasswordResetIntents = new _PasswordResetIntents();
export const Secrets = new _Secrets();
export const Tasks = new _Tasks();
export const UserRoles = new _UserRoles();
export const Users = new _Users();

export const collections = {
	...App.BaseCollections,
	"groups-to-users": GroupsToUsers,
	groups: Groups,
	"password-reset-intents": PasswordResetIntents,
	secrets: Secrets,
	tasks: Tasks,
	"user-roles": UserRoles,
	users: Users,
};
