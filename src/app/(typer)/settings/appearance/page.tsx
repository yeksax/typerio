"use client";

import Select from "@/components/FormInputs/select";
import { usePreferences } from "@/hooks/UserContext";
import { preferecesMap } from "@/utils/general/usefulConstants";
import { isMobile } from "react-device-detect";
import { SectionTitle } from "../pageTitle";
import Preference from "../preference";
import { useAtom } from "jotai";
import { themeAtom } from "@/atoms/appState";
import { useEffect } from "react";

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
	const [theme, setTheme] = useAtom(themeAtom);

	function setCurrentTheme(t: string) {
		localStorage.setItem("theme", t);
		setTheme(t);
	}

	return (
		<>
			<SectionTitle back>Aparência</SectionTitle>
			{preferences && (
				<div className='mt-2 flex flex-col gap-2 md:gap-4'>
					<Preference
						title='Tema'
						description={`Escolha o esquema de cores que você preferir :)`}
					>
						<Select
							onValueChange={setCurrentTheme}
							defaultValue={localStorage.getItem("theme") || "SYSTEM_DEFAULT"}
							values={preferecesMap.theme.values}
							texts={preferecesMap.theme.texts}
						/>
					</Preference>
				</div>
			)}
		</>
	);
}