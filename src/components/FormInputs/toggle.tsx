"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import Popover from "../Popover";

const gray = "rgb(156 163 175)";

interface Props {
	defaultValue: boolean;
	onValueChange?: (value: boolean) => void;
	dependencyValue?: boolean;
	userDependency?: boolean;
	ifUserError?: string;
	onUserError?: () => void;
}

export default function Toggle({
	defaultValue,
	onValueChange,
	dependencyValue,
	userDependency,
	onUserError,
	ifUserError,
}: Props) {
	const [value, setValue] = useState(
		defaultValue && (userDependency != undefined ? userDependency : true)
	);

	const [isBlocked, setBlockState] = useState(
		!(dependencyValue === undefined || dependencyValue === true)
	);

	const [userError, setUserError] = useState(false);

	useEffect(() => {
		let timeout: NodeJS.Timeout;
		if (onValueChange) onValueChange(value);

		if (
			userDependency != undefined &&
			userDependency === false &&
			value === true
		) {
			setUserError(true);
			if (onUserError) onUserError();
			timeout = setTimeout(() => {
				setUserError(false);
			}, 5000);
		}

		return () => {
			clearTimeout(timeout);
		};
	}, [value, userDependency]);

	useEffect(() => {
		setBlockState(
			!(dependencyValue === undefined || dependencyValue === true)
		);
	}, [dependencyValue]);

	return (
		<div className='relative'>
			<motion.div
				initial={{
					borderColor: isBlocked ? gray : "#000000",
				}}
				animate={{
					borderColor: isBlocked ? gray : "#000000",
				}}
				style={{
					justifyContent:
						value && !isBlocked ? "flex-end" : "flex-start",
				}}
				onClick={() => {
					if (!isBlocked) setValue(!value);
				}}
				className='w-8 h-fit border-2 p-0.5 rounded-full flex items-center cursor-pointer'
			>
				<motion.div
					initial={{
						backgroundColor: isBlocked ? gray : "#000000",
					}}
					animate={{
						backgroundColor: isBlocked ? gray : "#000000",
					}}
					layout
					className='h-2.5 w-2.5 rounded-full'
				></motion.div>
			</motion.div>
			<AnimatePresence>
				{userDependency != true &&
					userError &&
					value != userDependency && (
						<Popover
							onClick={(e) => {
								setUserError(false);
							}}
							anchor={["bottom", "right"]}
						>
							{ifUserError}
						</Popover>
					)}
			</AnimatePresence>
		</div>
	);
}
