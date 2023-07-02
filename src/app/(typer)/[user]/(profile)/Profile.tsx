"use client";

import Backdrop from "@/components/Modal/Backdrop";
import Modal from "@/components/Modal/Modal";
import { useModal } from "@/components/Modal/ModalContext";
import { uploadFiles } from "@/services/uploadthing";
import { _User } from "@/types/interfaces";
import { getRandomEmoji } from "@/utils/general/emoji";
import { dataURItoBlob } from "@/utils/general/files";
import { User } from "@prisma/client";
import { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";
import {
	FiCheck,
	FiClipboard,
	FiLink,
	FiLoader,
	FiMail,
	FiPlus,
	FiUserMinus,
	FiUserPlus,
	FiX,
} from "react-icons/fi";
import {
	editProfile,
	followUser,
	unfollowUser,
	uploadAvatar,
	uploadBanner,
} from "./actions";

interface Props {
	user: _User | null;
	isOwner: boolean;
	session: Session | null;
}

const months = [
	"Janeiro",
	"Fevereiro",
	"Março",
	"Abril",
	"Maio",
	"Junho",
	"Julho",
	"Agosto",
	"Setembro",
	"Outubro",
	"Novembro",
	"Dezembro",
];

export default function Profile({ user: $user, isOwner, session }: Props) {
	function getJoinDate(date: Date) {
		let str = "Entrou em ";
		str += months[date.getMonth()].toLowerCase();
		str += ` de ${date.getFullYear()}`;

		return str;
	}

	const page = usePathname().split("/")[1];
	const modalCtx = useModal();

	const formRef = useRef<HTMLFormElement>(null);
	const avatarInputRef = useRef<HTMLInputElement>(null);
	const bannerInputRef = useRef<HTMLInputElement>(null);
	const descriptionRef = useRef<HTMLTextAreaElement>(null);

	const [followCount, setFollowCount] = useState($user?._count.followers);
	const [isFollowing, setFollowing] = useState(
		$user?.followers.length! > 0 && !!session
	);
	const [followState, setFollowState] = useState(<>Seguir</>);
	const [randomEmoji, setRandomEmoji] = useState("🤫");
	const [profileUrls, setProfileUrls] = useState<
		{ url: string; isValid: boolean }[]
	>([]);

	const [_user, _setUser] = useState($user);
	const [user, setUser] = useState($user);

	const [editState, setEditState] = useState<{
		state: "saving" | "loading" | "done" | "idle" | "file_done";
		message?: string;
		children?: ReactNode;
	}>({
		state: "idle",
		message: "Salvar",
	});
	const [tagCompletion, setTagCompletion] = useState("");

	useEffect(() => {
		setRandomEmoji(getRandomEmoji("Smileys & Emotion"));
		if (descriptionRef.current) resize(descriptionRef.current);

		if (
			_user?.links &&
			typeof _user?.links === "object" &&
			Array.isArray(_user?.links)
		) {
			let urls = _user?.links as string[];

			setProfileUrls(urls.map((url) => ({ url, isValid: true })));
		}
	}, []);

	useEffect(() => {
		let timeout: NodeJS.Timeout;
		if (editState.state === "file_done") {
			timeout = setTimeout(() => {
				setEditState({
					state: "done",
					children: (
						<>
							<FiCheck size={14} />
							<span>Tudo pronto!</span>
						</>
					),
				});
			}, 2500);
		} else if (editState.state === "done") {
			timeout = setTimeout(() => {
				setEditState({
					state: "idle",
					children: <span>Salvar</span>,
				});
				modalCtx.close();
			}, 1500);
		}

		return () => {
			clearTimeout(timeout);
		};
	}, [editState.state]);

	function resize(e: HTMLElement) {
		e.style.height = "1lh";
		e.style.height = e.scrollHeight + "px";
	}

	if (!_user) return <>:p</>;
	if (!user) return <>:p</>;

	return (
		<>
			{isOwner && (
				<div className='absolute w-full h-full top-0 left-0 pointer-events-none'>
					<Backdrop />
					<Modal title='Editar Perfil'>
						<form
							ref={formRef}
							className='flex flex-col items-center gap-2'
							onSubmit={() => {
								setEditState({
									state: "loading",
									children: (
										<>
											<FiLoader
												size={16}
												className='animate-spin'
											/>
											<span>Aguarde...</span>
										</>
									),
								});
							}}
							action={async (e) => {
								let avatarFile: File = e.get("avatar") as File;
								let bannerFile: File = e.get("banner") as File;

								let avatar =
									avatarFile.size > 0 ? avatarFile : null;
								let banner =
									bannerFile.size > 0 ? bannerFile : null;

								let result = await editProfile({
									username: user.username,
									tag: user.tag + tagCompletion,
									name: user.name,
									bio: user.biography,
									urls: profileUrls.map((url) => url.url),
									session: session,
								});

								if (result == "error") {
								} else if (result == "not_allowed") {
								} else {
									setEditState({
										state: "done",
										children: (
											<>
												<FiCheck size={14} />
												<span>Tudo pronto!</span>
											</>
										),
									});

									let updatedUser = result as User;
									setUser({ ...user, ...updatedUser });
									_setUser({ ...user, ...updatedUser });

									let files: File[] = [];

									if (avatar) {
										files.push(
											new File(
												[dataURItoBlob(user.avatar)],
												`avatar.${avatar.name
													.split(".")
													.pop()}`,
												{ type: avatar.type }
											)
										);
									}

									if (banner) {
										files.push(
											new File(
												[dataURItoBlob(user.banner)],
												`banner.${banner.name
													.split(".")
													.pop()}`,
												{ type: banner.type }
											)
										);
									}

									if (files.length > 0)
										setEditState({
											state: "saving",
											children: (
												<>
													<FiLoader
														size={12}
														className='animate-spin'
													/>{" "}
													<span>
														Ultimos toques...
													</span>
												</>
											),
										});

									files.forEach(async (f) => {
										let res = (
											await uploadFiles({
												files: [f],
												endpoint: "userImageUploader",
											})
										)[0];

										let filename = res.fileKey
											.split("_")
											.pop();
										let file = filename!.split(".")[0];

										if (file === "avatar") {
											setEditState({
												state: "file_done",
												children: (
													<>
														<FiCheck size={14} />
														<span>Avatar</span>
													</>
												),
											});

											await uploadAvatar(
												res.fileUrl,
												user.id,
												session
											);
										}
										if (file === "banner") {
											setEditState({
												state: "file_done",
												children: (
													<>
														<FiCheck size={14} />
														<span>Banner</span>
													</>
												),
											});
											await uploadBanner(
												res.fileUrl,
												user.id,
												session
											);
										}
									});
								}
							}}
						>
							<div className='relative w-full pb-8'>
								<input
									type='file'
									name='avatar'
									accept='image/*'
									className='hidden'
									ref={avatarInputRef}
									onChange={(e: any) => {
										e.preventDefault();
										let files;

										if (e.dataTransfer) {
											files = e.dataTransfer.files;
										} else if (e.target.files) {
											files = e.target.files;
										}

										if (files.length == 0) return;

										const reader = new FileReader();
										reader.onload = () => {
											setUser({
												...user,
												avatar: reader.result as string,
											});
										};
										reader.readAsDataURL(files[0]);
									}}
								/>
								<input
									type='file'
									name='banner'
									accept='image/*'
									className='hidden'
									ref={bannerInputRef}
									onChange={(e: any) => {
										e.preventDefault();
										let files;

										if (e.dataTransfer) {
											files = e.dataTransfer.files;
										} else if (e.target.files) {
											files = e.target.files;
										}

										if (files.length == 0) return;

										const reader = new FileReader();
										reader.onload = () => {
											setUser({
												...user,
												banner: reader.result as string,
											});
										};
										reader.readAsDataURL(files[0]);
									}}
								/>

								<Image
									src={user.banner}
									width={300}
									height={100}
									alt={"preview do avatar de " + user.name}
									className='rounded-md object-cover border-2 border-black w-full h-20 md:h-32'
									onClick={() => {
										bannerInputRef.current?.click();
									}}
								/>
								<Image
									src={user.avatar}
									width={72}
									height={72}
									alt={"preview do avatar de " + user.name}
									onClick={() => {
										avatarInputRef.current?.click();
									}}
									className='rounded-md object-cover border-2 border-black w-16 h-16 md:w-24 md:h-24 absolute bg-white left-1/2 -translate-x-1/2 -translate-y-2/3'
								/>
							</div>
							<div className='flex flex-col w-full gap-4'>
								<div className='flex gap-2'>
									<div className='flex flex-col gap-1 mt-2 w-full'>
										<span className='text-xs font-semibold'>
											Username
										</span>
										<input
											type='text'
											maxLength={24}
											name='username'
											className='rounded-md box-content text-sm max-w-full px-2 py-0.5 border-2 border-black'
											value={user.name}
											onInput={(e) => {
												let el = e.currentTarget;
												el.style.width = `${Math.max(
													el.value.length,
													1
												)}ch`;

												setUser({
													...user,
													name: el.value.replace(
														"  ",
														" "
													),
												});
											}}
										/>
									</div>

									<div className='relative flex flex-col gap-1 mt-2'>
										<span className='text-xs font-semibold'>
											Tag
										</span>
										<input
											type='hidden'
											name='tag'
											value={user.tag + tagCompletion}
										/>
										<input
											type='text'
											style={{
												width: "4ch",
											}}
											className='box-content rounded-md text-sm w-full px-2 py-0.5 border-2 border-black'
											value={user.tag}
											onInput={(e) => {
												let newTag =
													e.currentTarget.value
														.trimStart()
														.trimEnd();

												let isValidTag =
													(newTag.match(/^[0-9]+$/) ||
														newTag.length === 0) &&
													newTag.length <= 4;

												if (isValidTag) {
													setUser({
														...user,
														tag: newTag,
													});
													setTagCompletion(
														"".padStart(
															4 - newTag.length,
															"0"
														)
													);
												}
											}}
										/>
										<span className='text-sm absolute bottom-1 right-2.5 text-gray-500 pointer-events-none'>
											{tagCompletion}
										</span>
									</div>
								</div>

								<div className='flex flex-col gap-1 relative'>
									<div className='text-xs font-semibold'>
										Descrição
									</div>
									<textarea
										onChange={(e) => {
											resize(e.target);
											setUser({
												...user,
												biography:
													e.currentTarget.value,
											});
										}}
										value={user.biography}
										ref={descriptionRef}
										name='biography'
										className={`resize-none box-border disabled:bg-white overflow-y-auto text-black w-full outline-none text-sm rounded-sm pl-2 border-l-2 border-gray-600 `}
										style={{
											height: "1lh",
											maxHeight: "4lh",
										}}
										placeholder={`Sem bio ainda... ${randomEmoji}`}
									></textarea>
								</div>

								<div className='flex flex-col mt-4 gap-1'>
									<div className='flex gap-1 items-center text-xs font-semibold'>
										Urls{" "}
										<FiPlus
											className='cursor-pointer'
											onClick={() => {
												setProfileUrls([
													...profileUrls,
													{
														url: "https://",
														isValid: false,
													},
												]);
											}}
										/>
									</div>
									<div className='flex flex-col gap-1'>
										{profileUrls.map((url, i) => (
											<div
												key={i}
												className='flex flex-col gap-1'
											>
												<div className='relative w-full flex items-center'>
													<input
														type='text'
														name='username'
														className={`px-6 pr-14 rounded-md text-sm w-full py-0.5 border-2 ${
															url.isValid
																? "border-black"
																: "border-red-500"
														}`}
														value={profileUrls[
															i
														].url.trim()}
														autoFocus={
															url.url ===
															"https://"
														}
														onInput={(e) => {
															let newUrl =
																e.currentTarget.value.trim();

															let isValidUrl =
																/[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/.test(
																	newUrl
																);

															setProfileUrls(
																(prev) =>
																	prev.map(
																		(
																			prevUrl,
																			j
																		) => ({
																			isValid:
																				i ===
																				j
																					? isValidUrl
																					: prevUrl.isValid,
																			url:
																				i ===
																				j
																					? newUrl
																					: prevUrl.url,
																		})
																	)
															);
														}}
													/>

													<FiLink
														size={12}
														className='absolute left-2'
													/>

													<FiClipboard
														size={16}
														className='absolute right-8'
														onClick={async () => {
															let newUrl =
																await navigator.clipboard.readText();
															let isValidUrl =
																/[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/.test(
																	newUrl
																);

															setProfileUrls(
																(prev) =>
																	prev.map(
																		(
																			prevUrl,
																			j
																		) => ({
																			isValid:
																				i ===
																				j
																					? isValidUrl
																					: prevUrl.isValid,
																			url:
																				i ===
																				j
																					? newUrl
																					: prevUrl.url,
																		})
																	)
															);
														}}
													/>

													<FiX
														size={16}
														onClick={() => {
															setProfileUrls(
																(prev) =>
																	prev.filter(
																		(
																			prevUrl,
																			j
																		) =>
																			i !==
																			j
																	)
															);
														}}
														className='absolute right-2 cursor-pointer'
													/>
												</div>
												{!url.isValid && (
													<div className='text-xs text-red-500'>
														Url inválido...
													</div>
												)}
											</div>
										))}
									</div>
								</div>
							</div>

							<div className='text-xs w-full flex justify-between items-center gap-4 mt-2'>
								<span
									className='bg-red-500 border-2 border-black cursor-pointer rounded-md text-white px-2 py-0.5'
									onClick={() => {
										setUser($user);
										modalCtx.close();
									}}
								>
									Descartar
								</span>
								<div className='flex items-center gap-2'>
									<span
										className='border-2 border-black cursor-pointer hover:text-white hover:bg-black transition-all rounded-md px-2 py-0.5'
										onClick={() => modalCtx.hide()}
									>
										Preview
									</span>
									<button
										className={`border-2 flex gap-2 items-center ${
											editState.state == "done" ||
											editState.state == "file_done"
												? "text-white bg-black"
												: ""
										} hover:text-white hover:bg-black transition-all disabled:border-gray-500 disabled:bg-white disabled:text-gray-500 border-black cursor-pointer rounded-md px-2 py-0.5`}
										type='submit'
										disabled={
											editState.state != "file_done" &&
											editState.state != "done" &&
											editState.state != "idle"
										}
									>
										{editState.children}
										{editState.message}
									</button>
								</div>
							</div>
						</form>
					</Modal>
				</div>
			)}
			<div className='relative pb-4'>
				<Image
					src={user?.banner}
					width={1200}
					quality={100}
					height={400}
					alt={`banner de ${user.name}`}
					className='border-b-2 object-cover border-black w-full h-32 md:h-40'
				/>
				<div className='absolute px-6 md:px-12 -translate-y-2/3 flex gap-4 items-end'>
					<Image
						src={user?.avatar}
						width={80}
						height={80}
						alt={`avatar de ${user.name}`}
						className='w-16 h-16 aspect-square object-cover md:w-20 md:h-20 border-2 border-black rounded-md bg-white'
					/>
					<div className='flex w-full mb-0.5 md:mb-1 items-center'>
						<span className='text-xs'>
							{getJoinDate(user.createdAt)}
						</span>
					</div>
				</div>
			</div>
			<div className='mt-6 md:mt-8 px-6 md:px-12 flex flex-col'>
				<div className='flex justify-between items-start gap-4'>
					<div className='font-semibold text-base w-full h-6 flex items-end min-w-0'>
						<h3 className='truncate break-all'>{user.name}</h3>
						<span className='font-regular opacity-70 text-sm'>
							#{user.tag + tagCompletion}
						</span>
					</div>

					{isOwner ? (
						<div
							onClick={() => modalCtx.open()}
							className=' cursor-pointer px-3 bg-white grid place-items-center py-0.5 text-black rounded-md hover:text-white hover:bg-black transition-all border-black border-2'
						>
							<span className='w-max text-xs'>Editar Perfil</span>
						</div>
					) : (
						session && (
							<div className='flex gap-2 align-center'>
								<button
									onMouseEnter={() =>
										setFollowState(
											<>
												<FiUserMinus size={16} />{" "}
												Unfollow
											</>
										)
									}
									onMouseLeave={() =>
										setFollowState(<>Seguindo</>)
									}
									onClick={async () => {
										if (!session) return;

										if (isFollowing) {
											setFollowCount(followCount! - 1);
											setFollowing(false);
											await unfollowUser(
												user.id,
												session.user!.id
											);
										} else {
											setFollowCount(followCount! + 1);
											setFollowing(true);
											await followUser(
												user.id,
												session.user!.id
											);
										}
									}}
									className={`px-3 text-xs ${
										isFollowing
											? "bg-black text-white hover:bg-red-500"
											: "bg-white text-black font-semibold hover:bg-black hover:text-white hover:font-normal"
									} transition-all grid place-items-center py-0.5 rounded-md border-black border-2`}
								>
									{isFollowing ? (
										<span className='flex gap-2 items-center'>
											{followState}
										</span>
									) : (
										<span className='flex gap-2 items-center'>
											<FiUserPlus size={16} /> Seguir
										</span>
									)}
								</button>
							</div>
						)
					)}
				</div>

				<div className='mt-4'>
					<pre className={`break-words text-xs whitespace-pre-wrap`}>
						{user.biography.length > 0 ? (
							user.biography
						) : (
							<span className='text-gray-700'>
								Sem biografia... {randomEmoji}
							</span>
						)}
					</pre>
				</div>

				{profileUrls && (
					<div className='flex gap-x-4 gap-y-1 mt-2 flex-wrap justify-between w-full'>
						{profileUrls.map((url, i) => (
							<Link
								key={i}
								href={url.isValid ? url.url : "#"}
								target='_blank'
								rel='noreferrer'
								prefetch={false}
								style={{
									maxWidth: "45%",
								}}
								className={`text-xs flex gap-2 items-center relative ${
									url.isValid
										? "text-blue-600"
										: "text-red-500"
								}`}
							>
								<FiLink size={12} className='absolute' />
								<span className='break-all line-clamp-1 pl-4'>
									{url.url
										.replaceAll("https://", "")
										.replaceAll("www.", "")
										.replaceAll("http://", "")}
								</span>
							</Link>
						))}
					</div>
				)}

				<div className='mt-4 text-sm flex justify-between items-center'>
					<Link href={`/${page}/followers`}>
						{followCount} seguidores
					</Link>
					<Link href={`/${page}/following`}>
						{user._count.following} seguindo
					</Link>
				</div>
			</div>
			<div className='border-b-2 px-6 md:px-12 mt-4 border-black flex justify-between'>
				<PageSwitcher href={`/${page}`}>Posts</PageSwitcher>
				<PageSwitcher href={`/${page}/replies`}>Respostas</PageSwitcher>
				<PageSwitcher href={`/${page}/likes`}>Curtidas</PageSwitcher>
			</div>
		</>
	);
}

interface LinkProps {
	href: string;
	children?: ReactNode;
}

function PageSwitcher({ href, children }: LinkProps) {
	const path = usePathname().split("/");
	const [hovering, setHovering] = useState(false);

	const isCurrentPage =
		path[path.length - 1] == href.split("/")[href.split("/").length - 1];

	return (
		<Link
			onMouseEnter={() => setHovering(true)}
			onMouseLeave={() => setHovering(false)}
			className={`text-sm w-full last-of-type:text-right first-of-type:text-left text-center py-4 hover:font-semibold ${
				isCurrentPage
					? "switcher-current-page font-semibold"
					: "switcher-page"
			} transition-all`}
			href={href}
		>
			{children}
		</Link>
	);
}
