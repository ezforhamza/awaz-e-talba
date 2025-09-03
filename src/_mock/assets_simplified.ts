import { faker } from "@faker-js/faker";
import type { Menu, Permission, Role, User } from "#/entity";
import { PermissionType } from "#/enum";

const { GROUP, MENU, CATALOGUE } = PermissionType;

export const DB_MENU: Menu[] = [
	// group
	{ id: "group_dashboard", name: "Dashboard", code: "dashboard", parentId: "", type: GROUP },
	{ id: "group_management", name: "Management", code: "management", parentId: "", type: GROUP },

	// Dashboard
	{
		id: "workbench",
		parentId: "group_dashboard",
		name: "Home",
		code: "workbench",
		icon: "local:ic-workbench",
		type: MENU,
		path: "/workbench",
		component: "/pages/dashboard/workbench",
	},

	// Management
	{
		id: "user_management",
		parentId: "group_management",
		name: "User Management",
		code: "user_management",
		icon: "local:ic-management",
		type: CATALOGUE,
		path: "/management",
	},
	{
		id: "user_profile",
		parentId: "user_management",
		name: "Profile",
		code: "user_management:profile",
		type: MENU,
		path: "/management/user/profile",
		component: "/pages/management/user/profile",
	},
	{
		id: "user_account",
		parentId: "user_management", 
		name: "Account",
		code: "user_management:account",
		type: MENU,
		path: "/management/user/account",
		component: "/pages/management/user/account",
	},
];

export const DB_USER: User[] = [
	{ id: "user_admin_id", username: "admin", password: "demo1234", avatar: faker.image.avatarGitHub(), email: "admin@awaz-e-talba.com" },
	{ id: "user_test_id", username: "test", password: "demo1234", avatar: faker.image.avatarGitHub(), email: "test@awaz-e-talba.com" },
	{ id: "user_guest_id", username: "guest", password: "demo1234", avatar: faker.image.avatarGitHub(), email: "guest@awaz-e-talba.com" },
];

export const DB_ROLE: Role[] = [
	{ id: "role_admin_id", name: "admin", code: "SUPER_ADMIN" },
	{ id: "role_test_id", name: "test", code: "TEST" },
];

export const DB_PERMISSION: Permission[] = [
	{ id: "permission_create", name: "permission-create", code: "permission:create" },
	{ id: "permission_read", name: "permission-read", code: "permission:read" },
	{ id: "permission_update", name: "permission-update", code: "permission:update" },
	{ id: "permission_delete", name: "permission-delete", code: "permission:delete" },
];

export const DB_USER_ROLE = [
	{ id: "user_admin_role_admin", userId: "user_admin_id", roleId: "role_admin_id" },
	{ id: "user_test_role_test", userId: "user_test_id", roleId: "role_test_id" },
];

export const DB_ROLE_PERMISSION = [
	{ id: faker.string.uuid(), roleId: "role_admin_id", permissionId: "permission_create" },
	{ id: faker.string.uuid(), roleId: "role_admin_id", permissionId: "permission_read" },
	{ id: faker.string.uuid(), roleId: "role_admin_id", permissionId: "permission_update" },
	{ id: faker.string.uuid(), roleId: "role_admin_id", permissionId: "permission_delete" },

	{ id: faker.string.uuid(), roleId: "role_test_id", permissionId: "permission_read" },
	{ id: faker.string.uuid(), roleId: "role_test_id", permissionId: "permission_update" },
];
