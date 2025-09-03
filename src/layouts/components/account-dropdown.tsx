import { useAuth } from "@/hooks/useAuth";
import { useAuth as useAuthContext } from "@/contexts/AuthContext";
import { useRouter } from "@/routes/hooks";
import { Button } from "@/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router";
import { toast } from "sonner";

/**
 * Account Dropdown
 */
export default function AccountDropdown() {
	const { replace } = useRouter();
	const { user: supabaseUser, signOut, isSigningOut } = useAuth();
	const { user: contextUser } = useAuthContext();
	const { t } = useTranslation();
	
	// Use context user data if available, fallback to supabase user
	const displayUser = contextUser || {
		name: supabaseUser?.user_metadata?.name || supabaseUser?.email?.split('@')[0] || 'User',
		profilePicture: supabaseUser?.user_metadata?.avatar_url,
	};
	const userEmail = supabaseUser?.email;
	
	const logout = async () => {
		try {
			await signOut();
			toast.success("Logged out successfully");
			replace("/auth/login");
		} catch (error) {
			toast.error("Failed to log out");
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="rounded-full">
					<img 
						className="h-6 w-6 rounded-full" 
						src={displayUser.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${userEmail}`} 
						alt="" 
					/>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56">
				<div className="flex items-center gap-2 p-2">
					<img 
						className="h-10 w-10 rounded-full" 
						src={displayUser.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${userEmail}`} 
						alt="" 
					/>
					<div className="flex flex-col items-start">
						<div className="text-text-primary text-sm font-medium">
							{displayUser.name}
						</div>
						<div className="text-text-secondary text-xs">{userEmail}</div>
					</div>
				</div>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<NavLink to="/profile">{t("sys.nav.user.profile")}</NavLink>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem 
					className="font-bold text-warning" 
					onClick={logout}
					disabled={isSigningOut}
				>
					{isSigningOut ? "Logging out..." : "Logout"}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
