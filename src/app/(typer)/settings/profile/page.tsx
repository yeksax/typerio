"use client";

import { userAtom } from "@/atoms/appState";
import Input from "@/components/FormInputs/input";
import { getJoinDate } from "@/utils/client/readableTime";
import { motion } from "framer-motion";
import { useAtom } from "jotai";
import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";
import { FiLoader } from "react-icons/fi";
import { SectionTitle } from "../pageTitle";
import { updateProfile } from "./actions";
import { uploadFiles } from "@/services/uploadthing";

export default function ProfileContainer() {
	const [user, setUser] = useAtom(userAtom);
	const [username, setUsername] = useState(user?.name || "");
	const [isSaving, setIsSaving] = useState(false);
	const [banner, setBanner] = useState<
		{ file: File | undefined; dataFile: string } | undefined
	>(undefined);
	const [avatar, setAvatar] = useState<
		{ file: File | undefined; dataFile: string } | undefined
	>(undefined);

	function setFile(
		e: ChangeEvent<HTMLInputElement>,
		target: "banner" | "avatar"
	) {
		let file: string | undefined;

		if (e.target.files?.length) {
			const reader = new FileReader();

			reader.onload = () => {
				file = reader.result as string;
				let fileObj = e.target.files![0];
				let ext = fileObj.name.split(".").pop();
				if (target === "banner") {
					return setBanner({
						dataFile: file,
						file: new File([fileObj], "banner." + ext, {
							type: fileObj.type,
						}),
					});
				}
				if (target === "avatar") {
					return setAvatar({
						dataFile: file,
						file: new File([fileObj], "avatar." + ext, {
							type: fileObj.type,
						}),
					});
				}
			};
			reader.readAsDataURL(e.target.files.item(0)!);
		} else {
			if (target === "banner") return setBanner(undefined);
			if (target === "avatar") return setAvatar(undefined);
		}
	}

	return (
		<>
			<SectionTitle className='px-6 md:px-12' back>
				Meu Perfil
			</SectionTitle>
			{user ? (
				<form
					onSubmit={(e) => {
						setIsSaving(true);
					}}
					action={async (e) => {
						let files: File[] = [];
						let bannerURL = user.banner;
						let avatarURL = user.avatar;

						if (banner?.file) files.push(banner.file);
						if (avatar?.file) files.push(avatar.file);

						let filesURLs = await uploadFiles({
							files,
							endpoint: "userImageUploader",
						});

						filesURLs.forEach((f) => {
							let file = f.fileKey.split("_")[1].split(".")[0];
							if (file === "avatar") avatarURL = f.fileUrl;
							if (file === "banner") bannerURL = f.fileUrl;
						});

						setBanner(undefined);
						setAvatar(undefined);
						setUser({
							...user,
							banner: bannerURL,
							avatar: avatarURL,
						});

						let updatedUser = await updateProfile({
							e,
							avatarURL,
							bannerURL,
						});
						setUser(updatedUser!);
						setIsSaving(false);
					}}
					className='flex flex-col gap-8 pb-80 relative'
				>
					<div className='top-[85vh] right-6 md:right-12 z-30 absolute flex justify-end'>
						<motion.button
							drag
							dragSnapToOrigin
							type='submit'
							disabled={isSaving}
							className='px-4 fixed flex gap-2 items-center disabled:text-zinc-500 py-1 border-2 border-r-4 border-b-4 border-black dark:border-zinc-950 text-xs rounded-md bg-white dark:bg-zinc-900'
						>
							{isSaving ? "Salvando..." : "Salvar Alterações"}
							{isSaving && (
								<FiLoader
									size={12}
									className='animate-spin text-black dark:text-zinc-50'
								/>
							)}
						</motion.button>
					</div>

					{/* banner, avatar */}
					<div className='relative'>
						<input
							type='file'
							name='banner'
							accept='image/*'
							id='banner'
							className='hidden'
							onChange={(e) => {
								setFile(e, "banner");
							}}
						/>
						<input
							type='file'
							name='avatar'
							accept='image/*'
							id='avatar'
							className='hidden'
							onChange={(e) => {
								setFile(e, "avatar");
							}}
						/>

						<Image
							src={banner?.dataFile || user.banner}
							width={1200}
							quality={100}
							height={400}
							onClick={() =>
								document.getElementById("banner")?.click()
							}
							alt={`banner de ${user.displayName}`}
							className='border-b-2 transition-all hover:brightness-75 cursor-pointer object-cover border-black dark:border-zinc-950 w-full h-32 md:h-40'
						/>

						<div className='absolute pointer-events-none px-6 md:px-12 -translate-y-2/3 flex gap-4 items-end'>
							<div className='relative w-16 h-16 pointer-events-auto aspect-square md:w-20 md:h-20'>
								<Image
									src={avatar?.dataFile || user.avatar}
									onClick={() =>
										document
											.getElementById("avatar")
											?.click()
									}
									width={156}
									height={156}
									alt={`avatar de ${user.displayName}`}
									className='w-full h-full object-cover transition-all hover:brightness-75 cursor-pointer border-2 dark:border-zinc-950 rounded-md bg-white border-black'
								/>
							</div>
							<div className='flex w-full mb-0.5 md:mb-1 items-center pointer-events-auto'>
								<span className='text-xs opacity-80'>
									{getJoinDate(user.createdAt)}
								</span>
							</div>
						</div>
					</div>

					{/* profile info... */}
					<div className='flex flex-col gap px-6 md:px-12 mt-8'>
						<div className='flex flex-col gap-6'>
							<Input
								label='Nome de exibição'
								name='displayName'
								placeholder={username}
								defaultValue={user.displayName || ""}
							/>
							<div className='flex gap-4 justify-between'>
								<Input
									label='Nome'
									name='name'
									placeholder='Nome de usuário'
									onChange={(e) =>
										setUsername(e.target.value)
									}
									defaultValue={user.name}
									className='w-3/5 md:w-3/4'
								/>
								<Input
									label='Tag'
									name='tag'
									prefix='#'
									placeholder='0000'
									defaultValue={user.tag}
									className='w-2/5 md:w-1/4'
									max={4}
								/>
							</div>

							<Input
								label='Descrição'
								name='description'
								placeholder='Sem descrição...'
								className='mt-2'
								defaultValue={user.biography}
								multiline
							/>

							<Input
								label='Link'
								name='link'
								className='w-full text-xs'
								matcher={
									/^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/
								}
								placeholder='eg. https://typer.vercel.app'
								defaultValue={
									((user.links as string[]) || null)[0] || ""
								}
							/>
						</div>
					</div>
				</form>
			) : (
				<div className='flex-1 h-full grid place-items-center'>
					<FiLoader size={20} className='animate-spin' />
				</div>
			)}
		</>
	);
}
