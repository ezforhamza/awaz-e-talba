import { Icon } from "@/components/icon";
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

interface ResetFormData {
	email: string;
}

function ResetForm() {
	const { t } = useTranslation();
	const { loginState, backToLogin } = useLoginStateContext();
	const { resetPassword, isResettingPassword, resetPasswordError } = useAuth();
	
	const form = useForm<ResetFormData>({
		defaultValues: {
			email: "",
		},
	});

	const onFinish = async (values: ResetFormData) => {
		try {
			await resetPassword(values.email);
			toast.success("Password reset email sent! Please check your inbox.");
			backToLogin();
		} catch (error) {
			toast.error(resetPasswordError || "Failed to send reset email. Please try again.");
		}
	};

	if (loginState !== LoginStateEnum.RESET_PASSWORD) return null;

	return (
		<>
			<div className="mb-8 text-center">
				<Icon icon="local:ic-reset-password" size="100" className="text-primary!" />
			</div>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onFinish)} className="space-y-4">
					<div className="flex flex-col items-center gap-2 text-center">
						<h1 className="text-2xl font-bold">Reset Password</h1>
						<p className="text-balance text-sm text-muted-foreground">
							Enter your email address and we'll send you a link to reset your password.
						</p>
					</div>

					{resetPasswordError && (
						<div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
							{resetPasswordError}
						</div>
					)}

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
									<Input type="email" placeholder="Enter your email" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit" className="w-full" disabled={isResettingPassword}>
						{isResettingPassword && <Loader2 className="animate-spin mr-2" />}
						{isResettingPassword ? "Sending..." : "Send Reset Email"}
					</Button>
					<ReturnButton onClick={backToLogin} />
				</form>
			</Form>
		</>
	);
}

export default ResetForm;
