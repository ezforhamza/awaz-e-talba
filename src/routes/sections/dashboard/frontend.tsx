import type { RouteObject } from "react-router";
import { Component } from "./utils";

export function getFrontendDashboardRoutes(): RouteObject[] {
	const frontendDashboardRoutes: RouteObject[] = [
		{ path: "dashboard", element: Component("/pages/dashboard") },
		{ path: "elections", element: Component("/pages/dashboard/elections") },
		{ path: "elections/create", element: Component("/pages/dashboard/elections/create") },
		{ path: "elections/edit/:id", element: Component("/pages/dashboard/elections/create") },
		{ path: "elections/view/:id", element: Component("/pages/dashboard/elections/view") },
		{ path: "candidates", element: Component("/pages/candidates") },
		{ path: "candidates/create", element: Component("/pages/candidates/create") },
		{ path: "candidates/edit/:id", element: Component("/pages/candidates/create") },
		{ path: "students", element: Component("/pages/students") },
		{ path: "students/create", element: Component("/pages/students/create") },
		{ path: "students/edit/:id", element: Component("/pages/students/create") },
		{ path: "bulk-upload", element: Component("/pages/bulk-upload") },
		{ path: "results", element: Component("/pages/results") },
		{ path: "analytics", element: Component("/pages/analytics") },
		{ path: "profile", element: Component("/pages/profile") },
	];
	return frontendDashboardRoutes;
}
