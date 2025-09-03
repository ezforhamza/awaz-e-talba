import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ReturnButton } from "./components/ReturnButton";
import { LoginStateEnum, useLoginStateContext } from "./providers/login-provider";

interface RegisterFormData {
	name: string;
	email: string;
	password: string;
	confirmPassword: string;
}

function RegisterForm() {
	const { t } = useTranslation();
	const { loginState, backToLogin } = useLoginStateContext();
	const { signUp, isSigningUp, signUpError } = useAuth();

	const form = useForm<RegisterFormData>({
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	const onFinish = async (values: RegisterFormData) => {
		try {
			await signUp({
				name: values.name,
				email: values.email,
				password: values.password,
			});
			toast.success("Registration successful! Please check your email to verify your account.");
			backToLogin();
		} catch (error) {
			toast.error(signUpError || "Registration failed. Please try again.");
		}
	};

	if (loginState !== LoginStateEnum.REGISTER) return null;

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onFinish)} className="space-y-4">
				<div className="flex flex-col items-center gap-2 text-center">
					<h1 className="text-2xl font-bold">Create Account</h1>
				</div>

				{signUpError && (
					<div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
						{signUpError}
					</div>
				)}

				<FormField
					control={form.control}
					name="name"
					rules={{ required: "Name is required" }}
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input placeholder="Full Name" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="email"
					rules={{ 
						required: "Email is required",
						pattern: {
							value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
							message: "Invalid email address"
						}
					}}
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input type="email" placeholder="Email" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="password"
					rules={{ 
						required: "Password is required",
						minLength: {
							value: 6,
							message: "Password must be at least 6 characters"
						}
					}}
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input type="password" placeholder="Password" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="confirmPassword"
					rules={{
						required: "Please confirm your password",
						validate: (value) => value === form.getValues("password") || "Passwords do not match",
					}}
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input type="password" placeholder="Confirm Password" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" className="w-full" disabled={isSigningUp}>
					{isSigningUp && <Loader2 className="animate-spin mr-2" />}
					{isSigningUp ? "Creating Account..." : "Create Account"}
				</Button>

				<div className="mb-2 text-xs text-gray">
					<span>{t("sys.login.registerAndAgree")}</span>
					<a href="./" className="text-sm underline! text-primary!">
						{t("sys.login.termsOfService")}
					</a>
					{" & "}
					<a href="./" className="text-sm underline! text-primary!">
						{t("sys.login.privacyPolicy")}
					</a>
				</div>

				<ReturnButton onClick={backToLogin} />
			</form>
		</Form>
	);
}

export default RegisterForm;
