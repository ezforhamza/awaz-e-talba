import { useAuth } from "@/hooks/useAuth";
import { useCallback, useEffect } from "react";
import { useRouter } from "../hooks";

type Props = {
	children: React.ReactNode;
};
export default function LoginAuthGuard({ children }: Props) {
	const router = useRouter();
	const { user, isUserLoading } = useAuth();

	const check = useCallback(() => {
		if (!isUserLoading && !user) {
			router.replace("/auth/login");
		}
	}, [router, user, isUserLoading]);

	useEffect(() => {
		check();
	}, [check]);

	if (isUserLoading) {
		return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
	}

	return <>{children}</>;
}
