"use client";

import { preferencesAtom, themeAtom } from "@/atoms/appState";
import Select from "@/components/FormInputs/select";
import PageTitle from "@/components/PageTitle";
import { setSpecificPreference } from "@/utils/client/userPreferences";
import { preferecesMap } from "@/utils/general/usefulConstants";
import { Theme } from "@prisma/client";
import { useAtom, useSetAtom } from "jotai";
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
	const [preferences, setPreferences] = useAtom(preferencesAtom);
	const setTheme = useSetAtom(themeAtom);

	function setCurrentTheme(t: Theme) {
		localStorage.setItem("theme", t);
		setSpecificPreference("theme", t, setPreferences)
		setTheme(t);
	}

	return (
		<>
			<PageTitle title='Aparência' />

			{preferences && (
				<div className='mt-2 flex flex-col gap-2 md:gap-4'>
					<Preference
						title='Tema'
						description={`Escolha o esquema de cores que você preferir :)`}
					>
						<Select
							onValueChange={setCurrentTheme}
							defaultValue={
								localStorage.getItem("theme") ||
								"SYSTEM_DEFAULT"
							}
							values={preferecesMap.theme.values}
							texts={preferecesMap.theme.texts}
						/>
					</Preference>
				</div>
			)}
		</>
	);
}
