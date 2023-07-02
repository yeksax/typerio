import { DMRequests } from "@prisma/client";
import { FiGlobe, FiSlash, FiUsers } from "react-icons/fi";

export const POSTS_PER_PAGE = 50;

export const preferecesMap = {
	dmRequests: {
		values: ["ALLOWED", "FOLLOWING_ONLY", "NOT_ALLOWED"] as DMRequests[],
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
};