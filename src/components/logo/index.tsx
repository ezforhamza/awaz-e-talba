import { cn } from "@/utils";
import { NavLink } from "react-router";
import LogoImage from "@/assets/icons/logo.png";

interface Props {
	size?: number | string;
	className?: string;
}
function Logo({ size = 50, className }: Props) {
	const sizeValue = typeof size === "string" ? size : `${size}px`;

	return (
		<NavLink to="/" className={cn(className)}>
			<img
				src={LogoImage}
				alt="Awaz-e-Talba"
				style={{ width: sizeValue, height: sizeValue }}
				className="object-contain"
			/>
		</NavLink>
	);
}

export default Logo;
