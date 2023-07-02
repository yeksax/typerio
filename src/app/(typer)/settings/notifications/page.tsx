"use client";

import { usePreferences } from "@/hooks/UserContext";
import { SectionTitle } from "../pageTitle";
import Toggle from "@/components/FormInputs/toggle";
import Preference from "../preference";
import { isMobile } from "react-device-detect";
import { useState } from "react";

interface Props {}

export default function NotificationPreferences({}: Props) {
	const { preferences, setPreferences } = usePreferences();

	const [allowNotifications, setAllowNotifications] = useState(
		preferences?.allowPushNotifications
	);

	return (
		<>
			<SectionTitle back>Notificações</SectionTitle>
			{preferences && (
				<div className='mt-4 flex flex-col gap-2 md:gap-4'>
					<Preference
						title='Notificações Push'
						description={`Dependency`}
					>
						<Toggle
							onValueChange={setAllowNotifications}
							defaultValue={preferences.allowPushNotifications}
						/>
					</Preference>

					<Preference
						title='Notificações Push'
						description={`Dependent`}
					>
						<Toggle
							onValueChange={(e) => {}}
							defaultValue={true}
							dependencyValue={allowNotifications}
						/>
					</Preference>
				</div>
			)}
		</>
	);
}
