import { LineLoading } from "@/components/loading";
import SimpleLayout from "@/layouts/simple";
import { Suspense, lazy } from "react";
import { Outlet, type RouteObject } from "react-router";

const Page403 = lazy(() => import("@/pages/sys/error/Page403"));
const Page404 = lazy(() => import("@/pages/sys/error/Page404"));
const Page500 = lazy(() => import("@/pages/sys/error/Page500"));
const VotePage = lazy(() => import("@/pages/vote"));
const VoteEntryPage = lazy(() => import("@/pages/vote-entry"));
const VoteBoothPage = lazy(() => import("@/pages/vote-booth"));

export const mainRoutes: RouteObject[] = [
	// Standalone voting page (no layout) - supports booth parameter
	{
		path: "/vote",
		element: (
			<Suspense fallback={<LineLoading />}>
				<VotePage />
			</Suspense>
		),
	},
	// Voting entry page - for entering voting ID
	{
		path: "/vote-entry",
		element: (
			<Suspense fallback={<LineLoading />}>
				<VoteEntryPage />
			</Suspense>
		),
	},
	// Voting booth page - for actual voting
	{
		path: "/vote-booth",
		element: (
			<Suspense fallback={<LineLoading />}>
				<VoteBoothPage />
			</Suspense>
		),
	},
	// Error pages and other public pages (with simple layout)
	{
		path: "/",
		element: (
			<SimpleLayout>
				<Suspense fallback={<LineLoading />}>
					<Outlet />
				</Suspense>
			</SimpleLayout>
		),
		children: [
			{ path: "500", element: <Page500 /> },
			{ path: "404", element: <Page404 /> },
			{ path: "403", element: <Page403 /> },
		],
	},
];
