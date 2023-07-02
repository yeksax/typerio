"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

interface Props {
	defaultValue: boolean;
	onValueChange?: (value: boolean) => void;
	dependencyValue?: boolean;
}

export default function Toggle({
	defaultValue,
	onValueChange,
	dependencyValue,
}: Props) {
	const [value, setValue] = useState(defaultValue);
	const [isBlocked, setBlockState] = useState(
		!(dependencyValue === undefined || dependencyValue === true)
	);

	useEffect(() => {
		if (onValueChange) onValueChange(value);
	}, [value]);

	useEffect(() => {
		setBlockState(
			!(dependencyValue === undefined || dependencyValue === true)
		);
	}, [dependencyValue]);

	return (
		<motion.div
			initial={{
				borderColor: isBlocked ? "#6b7280" : "#000000",
			}}
			animate={{
				borderColor: isBlocked ? "#6b7280" : "#000000",
			}}
			style={{
				justifyContent: value && !isBlocked ? "flex-end" : "flex-start",
			}}
			onClick={() => {
				if (!isBlocked) setValue(!value);
			}}
			className='w-8 h-fit border-2 p-0.5 rounded-full flex items-center cursor-pointer'
		>
			<motion.div
				initial={{
					backgroundColor: isBlocked ? "#6b7280" : "#000000",
				}}
				animate={{
					backgroundColor: isBlocked ? "#6b7280" : "#000000",
				}}
				layout
				className='h-2.5 w-2.5 rounded-full'
			></motion.div>
		</motion.div>
	);
}
