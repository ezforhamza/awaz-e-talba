import { Icon } from "@/components/icon";
import type { NavProps } from "@/components/nav";

export const frontendNavData: NavProps["data"] = [
	{
		name: "Election Management",
		items: [
			{
				title: "Dashboard",
				path: "/dashboard",
				icon: <Icon icon="solar:home-bold-duotone" size="24" />,
			},
			{
				title: "Elections",
				path: "/elections",
				icon: <Icon icon="solar:document-text-bold-duotone" size="24" />,
			},
			{
				title: "Candidates",
				path: "/candidates",
				icon: <Icon icon="solar:user-bold-duotone" size="24" />,
			},
		],
	},
	{
		name: "Voter Management",
		items: [
			{
				title: "Students",
				path: "/students",
				icon: <Icon icon="solar:users-group-rounded-bold-duotone" size="24" />,
			},
			{
				title: "Bulk Upload",
				path: "/bulk-upload",
				icon: <Icon icon="solar:upload-bold-duotone" size="24" />,
			},
		],
	},
	{
		name: "Reports & Analytics",
		items: [
			{
				title: "Results",
				path: "/results",
				icon: <Icon icon="solar:chart-bold-duotone" size="24" />,
			},
			{
				title: "Analytics",
				path: "/analytics",
				icon: <Icon icon="solar:chart-square-bold-duotone" size="24" />,
			},
		],
	},
	{
		name: "Settings",
		items: [
			{
				title: "Admin Profile",
				path: "/profile",
				icon: <Icon icon="solar:user-circle-bold-duotone" size="24" />,
			},
		],
	},
];
