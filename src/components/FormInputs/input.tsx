"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { FiX } from "react-icons/fi";

interface Props {
	placeholder: string;
	defaultValue: string;
	label: string;
	name: string;
	prefix?: string;
	max?: number;
	multiline?: boolean;
	matcher?: RegExp;
	className?: string;
	onDelete?: () => void;
	onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export default function Input({
	label,
	placeholder,
	defaultValue,
	name,
	prefix,
	max,
	className,
	onChange,
	onDelete,
	multiline,
	matcher,
}: Props) {
	const [value, setValue] = useState(defaultValue);
	const [isValid, setIsValid] = useState(
		matcher != undefined ? new RegExp(matcher).test(defaultValue) : true
	);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (multiline) resize();
	}, []);

	const resize = () => {
		if (!textareaRef.current) return;
		textareaRef.current.style.height = "1lh";
		textareaRef.current.style.height =
			textareaRef.current.scrollHeight + 4 + "px";
	};

	const props = {
		autoComplete: "off",
		autoCorrect: "off",
		autoCapitalize: "off",
		maxLength: max,
		style: {
			textIndent: `${prefix?.length ? prefix.length + 0.5 : 0}ch`,
		},
		className:
			"border-2 border-box bg-white invalid:border-red-500 text-red-500 dark:bg-zinc-900 rounded-md w-full text-sm border-zinc-300 text-zinc-700  dark:text-zinc-300 dark:focus:text-zinc-50 focus:text-black focus:border-black dark:border-zinc-850 px-4 py-1 dark:focus:border-zinc-600 transition-colors resize-none",
		type: "text",
		placeholder,
		value: value,
		onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			setValue(e.target.value.replace("\n\n\n", "\n\n"));

			if (matcher) {
				setIsValid(matcher.test(e.target.value.trim()));
			}
			if (multiline) resize();

			if (onChange) onChange(e);
		},
		name,
	};

	return (
		<div className={`group relative ${className ? className : "w-full"}`}>
			{multiline ? (
				<textarea ref={textareaRef} {...props} />
			) : (
				<input ref={inputRef} {...props} />
			)}

			<div className='absolute truncate group-focus-within:text-black dark:group-focus-within:text-zinc-300 transition-all text-zinc-700 text-xs font-semibold left-2 -top-3 mt-0.5 bg-white dark:bg-zinc-900 px-2'>
				{label}
			</div>
			<div className='absolute transition-all text-zinc-500 font-semibold left-4 top-1/2 -translate-y-1/2'>
				{prefix}
			</div>
			{onDelete && (
				<div className='absolute py-1 right-4 top-1/2 -translate-y-1/2 cursor-pointer bg-white dark:bg-zinc-900 pl-2'>
					<FiX onClick={onDelete} className='icon-hitbox' />
				</div>
			)}
		</div>
	);
}
