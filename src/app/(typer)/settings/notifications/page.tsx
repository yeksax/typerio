"use client";

import Toggle from "@/components/FormInputs/toggle";
import { usePreferences } from "@/hooks/UserContext";
import { useEffect, useRef, useState } from "react";
import { SectionTitle } from "../pageTitle";
import Preference from "../preference";
import { allowPushNotifications, setPreference } from "../actions";
import { isMobile } from "react-device-detect";
import { DMRequests, Preferences } from "@prisma/client";
import { setSpecificPreference } from "@/utils/client/userPreferences";

interface Props {}

const base64ToUint8Array = (base64: string) => {
	const padding = "=".repeat((4 - (base64.length % 4)) % 4);
	const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");

	const rawData = window.atob(b64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
};

export default function NotificationPreferences({}: Props) {
	const { preferences, setPreferences } = usePreferences();

	const [isSubscribed, setIsSubscribed] = useState<boolean | undefined>(
		undefined
	);
	const [canNotify, setCanNotify] = useState<boolean | undefined>(undefined);
	const [subscription, setSubscription] = useState<
		PushSubscription | undefined
	>(undefined);
	const [registration, setRegistration] = useState<
		ServiceWorkerRegistration | undefined
	>(undefined);

	useEffect(() => {
		navigator.permissions
			.query({
				name: "notifications",
			})
			.then((r) => {
				setCanNotify(r.state === "granted");
			});
	});

	useEffect(() => {
		navigator.serviceWorker.register("/sw.js", {
			scope: "/",
		});

		navigator.serviceWorker.ready.then((reg) => {
			reg.pushManager.getSubscription().then((sub: any) => {
				if (
					sub &&
					!(
						sub.expirationTime &&
						Date.now() > sub.expirationTime - 5 * 60 * 1000
					)
				) {
					setSubscription(sub);
					setIsSubscribed(true);
				}
			});
			setRegistration(reg);
		});
	}, []);

	const subscribeToPushNotifications = async () => {
		const sub = await registration?.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: base64ToUint8Array(
				process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY as string
			),
		});

		await allowPushNotifications(true, sub?.toJSON());
		setIsSubscribed(true);
		setSubscription(sub);
	};

	const unsubscribeToPushNotifications = async () => {
		await subscription?.unsubscribe();
		await allowPushNotifications(false, undefined);
		setSubscription(undefined);
		setIsSubscribed(false);
	};

	async function switchPushPermission(value: boolean) {
		console.log("call", value);

		if (value) await subscribeToPushNotifications();
		else await unsubscribeToPushNotifications();

		setPreferences((prev) => ({
			...(prev as Preferences),
			allowPushNotifications: value,
		}));
	}

	function switchFollowNoti(value: boolean) {
		setSpecificPreference(
			"allowFollowNotifications",
			value,
			setPreferences
		);
	}

	function switchReplyNoti(value: boolean) {
		setSpecificPreference("allowReplyNotifications", value, setPreferences);
	}

	function switchLikeNoti(value: boolean) {
		setSpecificPreference("allowLikeNotifications", value, setPreferences);
	}

	function switchDMNoti(value: boolean) {
		setSpecificPreference("allowDMNotifications", value, setPreferences);
	}

	return (
		<>
			<SectionTitle back>Notificações</SectionTitle>
			{preferences && (
				<div className='mt-2 flex flex-col gap-2 md:gap-4'>
					<Preference
						title='Notificações Push'
						description={`Deseja receber notificações no seu ${
							isMobile ? "celular" : "computador"
						}?`}
					>
						<Toggle
							onValueChange={switchPushPermission}
							defaultValue={preferences.allowPushNotifications}
							userDependency={canNotify}
							ifUserError='Você precisa autorizar notificações 🤗'
						/>
					</Preference>

					<Preference
						tabbed
						title='Novos seguidores'
						description='Notificar quando alguém te seguir'
					>
						<Toggle
							onValueChange={switchFollowNoti}
							defaultValue={preferences.allowFollowNotifications}
							dependencyValue={preferences.allowPushNotifications}
						/>
					</Preference>

					<Preference
						tabbed
						title='Curtidas'
						description='Notificar quando alguém curtir algo que você publicou'
					>
						<Toggle
							onValueChange={switchLikeNoti}
							defaultValue={preferences.allowLikeNotifications}
							dependencyValue={preferences.allowPushNotifications}
						/>
					</Preference>

					<Preference
						tabbed
						title='Menções'
						description='Notificar quando comentar em algo que você publicou'
					>
						<Toggle
							onValueChange={switchReplyNoti}
							defaultValue={preferences.allowReplyNotifications}
							dependencyValue={preferences.allowPushNotifications}
						/>
					</Preference>

					<Preference
						tabbed
						title='Mensagens'
						description='Notificar quando te enviarem alguma mensagem'
					>
						<Toggle
							onValueChange={switchDMNoti}
							defaultValue={preferences.allowDMNotifications}
							dependencyValue={preferences.allowPushNotifications}
						/>
					</Preference>
				</div>
			)}
		</>
	);
}
