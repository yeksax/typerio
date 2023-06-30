"use client";

import { useRouter } from "next/navigation";

export default function GoBack({
	text,
	className,
}: {
	text: string;
	className: string;
}) {
	const router = useRouter();

	return <button className={className} onClick={() => router.back()}>{text}</button>;
}
