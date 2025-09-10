import { Button } from "@/ui/button";
import { useTheme } from "@/theme/hooks/use-theme";
import { ThemeMode } from "@/types/enum";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
	const { mode, setMode } = useTheme();

	return (
		<Button
			variant="ghost"
			size="lg"
			onClick={() => setMode(mode === ThemeMode.Light ? ThemeMode.Dark : ThemeMode.Light)}
			className="absolute top-6 right-6 h-14 w-14 p-0 rounded-full shadow-lg bg-background/80 backdrop-blur-sm hover:bg-muted border"
		>
			{mode === ThemeMode.Light ? (
				<Moon className="h-7 w-7 text-foreground" />
			) : (
				<Sun className="h-7 w-7 text-foreground" />
			)}
		</Button>
	);
}
