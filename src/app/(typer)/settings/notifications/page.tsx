"use client";

import Toggle from "@/components/FormInputs/toggle";
import { usePreferences } from "@/hooks/UserContext";
import { useEffect, useState } from "react";
import { SectionTitle } from "../pageTitle";
import Preference from "../preference";

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

	const [isSubscribed, setIsSubscribed] = useState(false);
	const [subscription, setSubscription] = useState<
		PushSubscription | undefined
	>(undefined);
	const [registration, setRegistration] =
		useState<ServiceWorkerRegistration | null>(null);

	const [allowNotifications, setAllowNotifications] = useState(
		preferences?.allowPushNotifications
	);

	useEffect(() => {
		navigator.serviceWorker.register(
			"/sw.js",
			{
				scope: "/",
			}
		);

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

		setSubscription(sub);
		setIsSubscribed(true);
		console.log("web push subscribed!");
		console.log(sub);
	};

	useEffect(() => {
		console.log(allowNotifications);
		if (allowNotifications) subscribeToPushNotifications();
	}, [allowNotifications]);

	return (
		<>
			<SectionTitle back>Notificações</SectionTitle>
			{preferences && (
				<div className='mt-4 flex flex-col gap-6 md:gap-8'>
					<Preference
						title='Notificações Push'
						description={`Dependency`}
					>
						<Toggle
							onValueChange={setAllowNotifications}
							defaultValue={preferences.allowPushNotifications}
						/>
					</Preference>
				</div>
			)}
		</>
	);
}
