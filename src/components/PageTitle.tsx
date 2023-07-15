"use client";

import { useRouter } from "next/navigation";
import { FiChevronLeft } from "react-icons/fi";

interface Props {
	title: string;
}

export default function PageTitle({ title }: Props) {
	const router = useRouter();

	return (
		<div className='border-b-2 flex gap-4 items-center border-black px-4 md:px-8 text-base font-semibold py-2 md:py-4'>
			<button onClick={() => router.back()}>
				<FiChevronLeft size={14} />
			</button>

			{title}
		</div>
	);
}
