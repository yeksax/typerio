export default function PostSkeleton() {
	return (
		<div className='border-b-2 border-black px-4 py-1.5 md:px-8 md:py-4 flex gap-4 w-full'>
			<div className='ceiled-md w-9 h-9 aspect-square object-cover bg-gray-200 animate-pulse rounded-md' />
			<div className='flex flex-col gap-0.5 w-full'>
				<div className='flex gap-1.5 items-center text-gray-300 text-xs'>
					<h3 className='text-sm h-4 font-medium w-28 rounded-md mt-0.5 bg-gray-300 animate-pulse'></h3>
					&bull;
					<h3 className='text-sm h-4 font-medium w-32 rounded-md mt-0.5 bg-gray-200 animate-pulse'></h3>
				</div>

				<div className='flex flex-col mt-1 gap-1'>
					<pre className='w-2/3 rounded-sm h-4 font-medium bg-gray-200 animate-pulse '></pre>
				</div>
			</div>
		</div>
	);
}
