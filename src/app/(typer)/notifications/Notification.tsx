"use client";

import { _Notification } from "@/types/interfaces";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import {
	FiHeart,
	FiHelpCircle,
	FiMessageSquare,
	FiUserPlus,
} from "react-icons/fi";

interface Props {
	notification: _Notification;
}

function ParamReplacing(str: string, params: string[] | undefined) {
	if (!params) return str;

	params.forEach((param, i) => {
		let regex = `\\$_${i}`;
		let re = new RegExp(regex, "g");
		str = str.replace(re, param);
	});

	return str;
}

export default function Notification({ notification }: Props) {
	const notificationActors = notification.notificationActors?.users.map(
		(user) => user.name
	);

	const iconSize = 24;
	let actors = "";
	let enumAction = notification.action;
	let actionIcon: ReactNode = <FiHelpCircle size={iconSize} />;

	let singleAction = "";
	let pluralAction = "";

	if (enumAction === "FOLLOW") {
		actionIcon = <FiUserPlus size={iconSize} />;
		singleAction = "seguiu";
		pluralAction = "seguiram";
	}

	if (enumAction === "LIKE") {
		actionIcon = <FiHeart size={iconSize} stroke="none" className="fill-red-500"/>;
		singleAction = "curtiu";
		pluralAction = "curtiram";
	}

	if (enumAction === "REPLY") {
		actionIcon = <FiMessageSquare size={iconSize} stroke="none" className="fill-slate-400"/>;
		singleAction = "respondeu";
		pluralAction = "responderam";
	}

	if (notificationActors) {
		if (notificationActors.length > 1)
			actors = notificationActors[0] + ` e outros ${pluralAction} `;
		else actors = notificationActors[0] + ` ${singleAction} `;
	}

	return (
		<Link
			href={
				notification.redirect.length > 0 ? notification.redirect : "#"
			}
			className={`flex gap-4 md:gap-8 items-center px-4 md:px-8 py-1 md:py-2  border-b-2 border-black ${
				notification.isRead ? "bg-white" : "bg-slate-200"
			}`}
		>
			{actionIcon}
			<div className={`flex gap-2 flex-col w-full`}>
				{notification.notificationActors && (
					<div className='flex relative h-6'>
						{notification.notificationActors.users.map(
							(user, i) => (
								<motion.div
									className='w-fit absolute'
									style={{
										top: "50%",
										transform: "translateY(-50%)",
										zIndex:
											notification.notificationActors!
												.users.length - i,
									}}
									initial={{
										opacity: 0,
									}}
									animate={{
										left: 16 * i,
										opacity: 1,
									}}
									transition={{
										delay: 0.1 * i,
									}}
									key={i}
								>
									<Image
										width={64}
										height={64}
										src={user.avatar}
										className='rounded-full w-6 h-6 bg-white'
										alt={`${user.name} profile picture`}
									/>
								</motion.div>
							)
						)}
					</div>
				)}
				<div className='flex flex-col gap-0 5'>
					<div className='font-semibold text-sm'>
						{ParamReplacing(notification.title, [actors])}
					</div>
					<div className='text-xs'>{notification.text}</div>
				</div>
			</div>
		</Link>
	);
}
