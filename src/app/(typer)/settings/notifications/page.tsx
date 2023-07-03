"use client";

import Toggle from "@/components/FormInputs/toggle";
import { usePreferences } from "@/hooks/UserContext";
import { useEffect, useState } from "react";
import { SectionTitle } from "../pageTitle";
import Preference from "../preference";
import { allowPushNotifications, setPreference } from "../actions";
import { isMobile } from "react-device-detect";
import { DMRequests, Preferences } from "@prisma/client";

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

	const [subscription, setSubscription] = useState<
		PushSubscription | undefined
	>(undefined);
	const [registration, setRegistration] =
		useState<ServiceWorkerRegistration | null>(null);

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

		allowPushNotifications(true, sub?.toJSON());
	};

	const unsubscribeToPushNotifications = async () => {
		await subscription?.unsubscribe();
		allowPushNotifications(false, undefined);
	};

	function switchPushPermission(value: boolean) {
		setPreferences((prev) => ({
			...(prev as Preferences),
			allowPushNotifications: value,
		}));

		if (value) subscribeToPushNotifications();
		else unsubscribeToPushNotifications();
	}

	async function setSpecificPreference(
		key: keyof Preferences,
		value: boolean | DMRequests
	) {
		const data: any = {};
		data[key] = value;

		setPreferences((prev) => ({
			...(prev as Preferences),
			data,
		}));

		await setPreference(key, value);
	}

	function switchFollowNoti(value: boolean) {
		setSpecificPreference("allowFollowNotifications", value);
	}

	function switchReplyNoti(value: boolean) {
		setSpecificPreference("allowReplyNotifications", value);
	}

	function switchLikeNoti(value: boolean) {
		setSpecificPreference("allowLikeNotifications", value);
	}

	function switchDMNoti(value: boolean) {
		setSpecificPreference("allowDMNotifications", value);
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
