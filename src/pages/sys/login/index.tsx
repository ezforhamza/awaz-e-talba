import HeroImg from "@/assets/icons/hero.jpg";
import LocalePicker from "@/components/locale-picker";
import Logo from "@/components/logo";
import { GLOBAL_CONFIG } from "@/global-config";
import SettingButton from "@/layouts/components/setting-button";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router";
import LoginForm from "./login-form";
import { LoginProvider } from "./providers/login-provider";
import RegisterForm from "./register-form";
import ResetForm from "./reset-form";

function LoginPage() {
	const { user, isUserLoading } = useAuth();

	if (isUserLoading) {
		return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
	}

	if (user) {
		return <Navigate to={GLOBAL_CONFIG.defaultRoute} replace />;
	}

	return (
		<div className="relative grid min-h-svh lg:grid-cols-2 bg-background">
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div className="flex justify-center gap-2 md:justify-start">
					<div className="flex items-center gap-2 font-medium cursor-pointer">
						<Logo size={28} />
						<span>{GLOBAL_CONFIG.appName}</span>
					</div>
				</div>
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-xs">
						<LoginProvider>
							<LoginForm />
							<RegisterForm />
							<ResetForm />
						</LoginProvider>
					</div>
				</div>
			</div>

			<div className="relative hidden bg-background-paper lg:block">
				<img
					src={HeroImg}
					alt="Awaz-e-Talba - Student Voting System"
					className="absolute inset-0 h-full w-full object-cover"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
				<div className="absolute bottom-8 left-8 right-8 text-white">
					<h2 className="text-3xl font-bold mb-2">Awaz-e-Talba</h2>
					<p className="text-lg opacity-90">Empowering student voices through secure, transparent elections</p>
				</div>
			</div>

			<div className="absolute right-2 top-0 flex flex-row">
				<LocalePicker />
				<SettingButton />
			</div>
		</div>
	);
}
export default LoginPage;
