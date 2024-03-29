import { FiLoader } from "react-icons/fi";

export default function Loading() {
	// You can add any UI inside Loading, including a Skeleton.
	return (
		<div className='flex-1 h-full grid place-items-center'>
			<FiLoader className='animate-spin' size={24} />
		</div>
	);
}
