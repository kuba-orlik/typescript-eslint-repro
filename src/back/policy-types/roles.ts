import { Context, Policy, QueryTypes } from "sealious";

export class Roles extends Policy {
	static type_name = "roles";
	allowed_roles: string[];
	constructor(allowed_roles: string[]) {
		super(allowed_roles);
		this.allowed_roles = allowed_roles;
	}

	async countMatchingRoles(context: Context) {
		const user_id = context.user_id;
		context.app.Logger.debug2("ROLES", "Checking the roles for user", user_id);
		const user_roles = await context.app.collections["user-roles"]
			.list(context)
			.filter({ user: user_id })
			.fetch();
		const roles = user_roles.items.map((user_role) => user_role.get("role"));

		return this.allowed_roles.filter((allowed_role) => roles.includes(allowed_role))
			.length;
	}

	async _getRestrictingQuery(context: Context) {
		if (context.is_super) {
			return new QueryTypes.AllowAll();
		}
		if (context.user_id === null) {
			return new QueryTypes.DenyAll();
		}

		const matching_roles_count = await this.countMatchingRoles(context);

		return matching_roles_count > 0
			? new QueryTypes.AllowAll()
			: new QueryTypes.DenyAll();
	}

	async checkerFunction(context: Context) {
		if (context.user_id === null) {
			return Policy.deny(context.app.i18n("policy_logged_in_deny"));
		}
		const matching_roles_count = await this.countMatchingRoles(context);

		return matching_roles_count > 0
			? Policy.allow(
					context.app.i18n("policy_roles_allow", [
						this.allowed_roles.join(", "),
					])
			  )
			: Policy.deny(
					context.app.i18n("policy_roles_deny", [this.allowed_roles.join(", ")])
			  );
	}
}
