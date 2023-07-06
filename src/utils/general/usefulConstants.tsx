import { AnonymousPermissions } from "@prisma/client";
import { ReactNode } from "react";
import {
	FiGlobe,
	FiMonitor,
	FiMoon,
	FiSlash,
	FiSun,
	FiUsers,
} from "react-icons/fi";

export const POSTS_PER_PAGE = 20;

export const preferecesMap = {
	dmRequests: {
		values: [
			"ALLOWED",
			"FOLLOWING_ONLY",
			"NOT_ALLOWED",
		] as AnonymousPermissions[],
		texts: [
			<>
				<FiGlobe /> Todos
			</>,
			<>
				<FiUsers /> Apenas amigos
			</>,
			<>
				<FiSlash /> Ninguém
			</>,
		],
	},
	theme: {
		values: ["LIGHT", "DARK", "SYSTEM_DEFAULT"],
		texts: [
			<>
				<FiSun /> Claro
			</>,
			<>
				<FiMoon /> Escuro
			</>,
			<>
				<FiMonitor /> Seguir o Sistema
			</>,
		],
	},
};
