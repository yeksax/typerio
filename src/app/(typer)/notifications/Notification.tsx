"use client";

import { _Notification } from "@/types/interfaces";
import {
	IconDefinition,
	faBolt,
	faCertificate,
	faComment,
	faHeart,
	faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

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

	let actors = "";
	let enumAction = notification.action;
	let actionIcon: IconDefinition = faBolt;

	let singleAction = "";
	let pluralAction = "";

	if (enumAction === "FOLLOW") {
		actionIcon = faUserPlus;
		singleAction = "seguiu";
		pluralAction = "seguiram";
	}

	if (enumAction === "LIKE") {
		actionIcon = faHeart;
		singleAction = "curtiu";
		pluralAction = "curtiram";
	}

	if (enumAction === "REPLY") {
		actionIcon = faComment;
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
			href={notification.redirect}
			className={`flex gap-4 items-center px-4 md:px-8 py-1 md:py-2  border-b-2 border-black ${
				notification.isRead ? "bg-white" : "bg-slate-200"
			}`}
		>
			<div className={`flex gap-2 flex-col w-full`}>
				{notification.notificationActors && (
					<div className='flex relative h-6'>
						{notification.notificationActors.users.map(
							(user, i) => (
								<motion.div
									className='absolute w-6 h-6 bg-white rounded-full object-fill'
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
										className='rounded-full'
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
			<FontAwesomeIcon size='lg' icon={actionIcon} />
		</Link>
	);
}
