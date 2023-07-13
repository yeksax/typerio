"use client";

import {
	Dispatch,
	ReactNode,
	SetStateAction,
	useEffect,
	useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";
import { Theme } from "@prisma/client";

interface Props {
	defaultValue: string;
	values: string[];
	texts: ReactNode[];
	onValueChange?: (value: Theme) => void;
}

export default function Select({
	defaultValue,
	texts,
	values,
	onValueChange,
}: Props) {
	const [value, setValue] = useState(defaultValue);
	const [text, setText] = useState<ReactNode>(texts[values.indexOf(value)]);
	const [expanded, setExpanded] = useState(false);

	useEffect(() => {
		setText(texts[values.indexOf(value)]);
		if (onValueChange) onValueChange(value as Theme);
	}, [value]);

	return (
		<motion.form className={`relative h-fit w-max`}>
			<input name='value' value={value} type='hidden' />
			<div
				className={`font-semibold flex rounded-md dark:bg-zinc-800 bg-white border-black dark:border-zinc-950 border-2 justify-between gap-2 items-center cursor-pointer py-0.5 px-3`}
				onClick={() => setExpanded(!expanded)}
			>
				<div className='flex items-center gap-2'>{text}</div>
				<motion.div
					animate={{
						rotate: expanded ? 180 : 0,
					}}
				>
					<FiChevronDown size={14} />
				</motion.div>
			</div>
			<AnimatePresence>
				{expanded && (
					<motion.div
						initial={{
							height: 0,
						}}
						animate={{
							height: "max-content",
						}}
						exit={{
							height: 0,
						}}
						className='overflow-hidden flex mt-1 flex-col min-w-max w-full absolute z-10 right-0 rounded-md dark:bg-zinc-800 bg-white border-black dark:border-zinc-950 border-2'
					>
						{values.map((currentValue, i) => (
							<motion.div
								key={currentValue}
								initial={{
									opacity: 0,
								}}
								animate={{
									opacity: 1,
								}}
								transition={{
									delay: i * 0.1 + 0.1,
								}}
							>
								<Option
									value={currentValue}
									setValue={setValue}
									setExpanded={setExpanded}
									isSelected={currentValue === value}
								>
									{texts[i]}
								</Option>
							</motion.div>
						))}
					</motion.div>
				)}
			</AnimatePresence>
		</motion.form>
	);
}

function Option({
	value,
	children,
	setValue,
	isSelected,
	setExpanded,
}: {
	value: string;
	children: ReactNode;
	setValue: Dispatch<SetStateAction<string>>;
	setExpanded: Dispatch<SetStateAction<boolean>>;
	isSelected: boolean;
}) {
	return (
		<div
			className={`flex gap-2 items-center px-3 py-1.5 hover:bg-black hover:text-white cursor-pointer font-semibold ${
				isSelected ? "bg-black text-white" : ""
			}`}
			onClick={() => {
				setValue(value);
				setExpanded(false);
			}}
		>
			{children}
		</div>
	);
}
