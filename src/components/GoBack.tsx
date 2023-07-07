"use client";

import { useRouter } from "next/navigation";
import { FiChevronLeft } from "react-icons/fi";

export default function GoBack({
	text,
	className,
}: {
	text?: string;
	className: string;
}) {
	const router = useRouter();

	return (
		<button className={className} onClick={() => router.back()}>
			{text ? text : <FiChevronLeft size={16} />}
		</button>
	);
}
