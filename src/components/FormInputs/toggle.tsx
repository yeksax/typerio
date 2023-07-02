"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

interface Props {
	defaultValue: boolean;
	onValueChange: (value: boolean) => void;
}

export default function Toggle({ defaultValue, onValueChange }: Props) {
	const [value, setValue] = useState(defaultValue);

	useEffect(() => {
		onValueChange(value);
	}, [value]);

	return (
		<div
			style={{
				justifyContent: value ? "flex-end" : "flex-start",
			}}
			onClick={() => setValue(!value)}
			className='w-8 h-fit border-black border-2 p-0.5 rounded-full flex items-center cursor-pointer'
		>
			<motion.div
				layout
				className='h-2.5 w-2.5 bg-black rounded-full'
			></motion.div>
		</div>
	);
}
