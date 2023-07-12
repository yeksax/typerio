"use server";

import {
	newNotification,
	newPushNotification,
	removeNotification,
	updateNotification,
} from "@/utils/server/userNotifications";
import { prisma } from "@/services/prisma";
import { pusherServer } from "@/services/pusher";
import { _Notification, _Post } from "@/types/interfaces";
import { removeAccents } from "@/utils/general/string";
import { updatePercent } from "@/utils/server/loadingBars";
import { User } from "@prisma/client";
import { Session } from "next-auth";

export async function likePost(postId: string, user: string) {
	const post = await prisma.post.update({
		where: {
			id: postId,
		},
		data: {
			likedBy: {
				connect: {
					id: user,
				},
			},
		},
		include: {
			author: true,
		},
	});

	const whoLiked = await prisma.user.findUnique({
		where: {
			id: user,
		},
	});

	const authorId = post.userId;

	if (user == authorId) return 200;

	const author = await prisma.user.findUniqueOrThrow({
		where: {
			id: authorId,
		},
		select: {
			notifications: {
				where: {
					action: "LIKE",
					redirect: `/${removeAccents(post.author.username)}/type/${
						post.id
					}`,
				},
				include: {
					notificationActors: {
						select: {
							id: true,
						},
					},
				},
			},
		},
	});

	let notification: _Notification;

	if (author.notifications.length > 0) {
		await prisma.notificationActors.update({
			where: {
				notificationId: author.notifications[0].id,
			},
			data: {
				users: {
					connect: {
						id: user,
					},
				},
			},
		});

		notification = await prisma.notification.update({
			where: {
				id: author.notifications[0].id,
			},
			data: {
				isRead: false,
				title: `$_0 ${post.repliedId ? "seu comentário" : "seu post"}!`,
				icon: whoLiked?.avatar,
			},
		});
	} else {
		notification = await prisma.notification.create({
			data: {
				action: "LIKE",
				title: `$_0 ${post.repliedId ? "seu comentário" : "seu post"}!`,
				text: post.content,
				icon: whoLiked?.avatar,
				redirect: `/${removeAccents(post.author.username)}/type/${
					post.id
				}`,
				notificationReceiver: {
					connect: {
						id: authorId,
					},
				},
				notificationActors: {
					create: {
						users: {
							connect: {
								id: user,
							},
						},
					},
				},
			},
			include: {
				notificationActors: {
					include: {
						users: true,
					},
				},
			},
		});
	}

	await newNotification(authorId, notification);
	await newPushNotification({
		userID: authorId,
		scope: "allowLikeNotifications",
		notification: {
			action: "LIKE",
			notificationActors: notification.notificationActors,
			redirect: notification.redirect,
			text: notification.text,
			title: notification.title,
			icon: notification.icon,
		},
	});
}

export async function unlikePost(postId: string, user: string) {
	const post = await prisma.post.update({
		where: {
			id: postId,
		},
		data: {
			likedBy: {
				disconnect: {
					id: user,
				},
			},
		},
		include: {
			author: true,
		},
	});

	const author = await prisma.user.findUniqueOrThrow({
		where: {
			id: post.userId,
		},
		select: {
			notifications: {
				where: {
					action: "LIKE",
					redirect: `/${removeAccents(post.author.username)}/type/${
						post.id
					}`,
				},
				include: {
					notificationActors: {
						select: {
							id: true,
							_count: {
								select: {
									users: true,
								},
							},
						},
					},
				},
			},
		},
	});

	if (!author.notifications[0].notificationActors) return;

	if (author.notifications[0].notificationActors._count.users === 1) {
		await prisma.notificationActors.delete({
			where: {
				notificationId: author.notifications[0].id,
			},
		});

		const notification = await prisma.notification.delete({
			where: {
				id: author.notifications[0].id,
			},
		});

		await removeNotification(post.userId, notification);
	} else {
		const notification = await prisma.notification.update({
			where: {
				id: author.notifications[0].id,
			},
			include: {
				notificationActors: {
					include: {
						users: true,
					},
				},
			},
			data: {
				notificationActors: {
					update: {
						users: {
							disconnect: {
								id: user,
							},
						},
					},
				},
			},
		});

		await updateNotification(post.userId, notification);
	}
}

export async function reply(postId: string, userId: string, data: FormData) {
	const channel = `${userId}__${postId}__reply`;

	await updatePercent(channel, 10);
	if (data.get("content")!.length == 0) return;

	await updatePercent(channel, 30);

	const { thread: mainThread } = await prisma.post.findUniqueOrThrow({
		where: {
			id: postId,
		},
		select: {
			thread: true,
		},
	});

	const reply: _Post = await prisma.post.create({
		data: {
			content: data.get("content")?.toString().trim()!,
			thread: {
				connect: [
					...mainThread.map((t) => ({ id: t.id })),
					{ id: postId },
				],
			},
			replied: {
				connect: {
					id: postId,
				},
			},
			author: {
				connect: {
					id: userId,
				},
			},
		},
		include: {
			likedBy: true,
			author: true,
			replied: {
				include: {
					author: true,
				},
			},
			_count: {
				select: {
					replies: true,
					likedBy: true,
				},
			},
		},
	});

	await updatePercent(channel, 70);

	const user = reply.author;

	await pusherServer.trigger(`post-${postId}`, "new-reply", reply);

	if (user.id !== reply.replied?.author.id) {
		const notification = await prisma.notification.create({
			include: {
				notificationActors: {
					include: {
						users: true,
					},
				},
			},
			data: {
				action: "REPLY",
				//$_n representa placeholders que serão rescritos
				icon: reply.author?.avatar,
				title: `$_0 ${
					reply.repliedId ? "seu comentário" : "seu post"
				}!`,
				text: reply.content,
				redirect: `${removeAccents(reply.author.username)}/type/${
					reply.id
				}`,
				notificationReceiver: {
					connect: {
						id: reply.replied!.author.id,
					},
				},
				notificationActors: {
					create: {
						users: {
							connect: {
								id: user.id,
							},
						},
					},
				},
			},
		});

		await newNotification(reply.replied!.author.id, notification);
		await newPushNotification({
			userID: reply.replied!.author.id,
			scope: "allowReplyNotifications",
			notification: {
				action: "REPLY",
				notificationActors: notification.notificationActors,
				redirect: notification.redirect,
				text: notification.text,
				title: notification.title,
				icon: notification.icon,
			},
		});
	}

	await updatePercent(channel, 100);
	await updatePercent(channel, 0);

	return reply;
}

export async function deletePost(postId: string, author?: string) {
	const post = await prisma.post.update({
		where: {
			id: postId,
		},
		data: {
			deleted: true,
		},
		include: {
			author: true,
		},
	});

	await pusherServer.trigger("explore", "remove-post", postId);
	await pusherServer.trigger(`post__${postId}`, "deleted-post", null);
	await pusherServer.trigger(
		`user__${post.userId}_post`,
		"remove-post",
		postId
	);
}

export async function pinPost(postID: string, session: Session) {
	const user: User & { pinnedPost: _Post | null } = await prisma.user.update({
		where: {
			id: session.user!.id,
		},
		data: {
			pinnedPostId: postID,
		},
		include: {
			pinnedPost: {
				include: {
					attachments: true,
					invite: {
						include: {
							owner: true,
							chat: {
								include: {
									_count: {
										select: {
											members: true,
										},
									},
								},
							},
						},
					},
					author: session?.user?.id
						? {
								include: {
									followers: {
										where: {
											id: session.user.id,
										},
									},
								},
						  }
						: true,
					likedBy: {
						select: {
							id: true,
						},
					},
					_count: {
						select: {
							replies: true,
							likedBy: true,
						},
					},
				},
			},
		},
	});

	await pusherServer.trigger(
		`user__${user.id}__pinned`,
		"pin",
		user.pinnedPost
	);
}

export async function unpinPost(post: string, session: Session) {
	const user = await prisma.user.update({
		where: {
			id: session.user!.id,
		},
		data: {
			pinnedPostId: null,
		},
	});

	await pusherServer.trigger(`user__${user.id}__pinned`, "unpin", null);
}
