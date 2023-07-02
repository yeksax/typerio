"use client";

import Select from "@/components/FormInputs/select";
import Preference from "./preference";
import { preferecesMap } from "@/utils/general/usefulConstants";
import { isMobile } from "react-device-detect";
import Toggle from "@/components/FormInputs/toggle";
import { Preferences } from "@prisma/client";

interface Props {
	preferences: Preferences;
}

export default function Preferences({ preferences }: Props) {
	return (
		<div className='mt-4 flex flex-col gap-4 md:gap-8'>
			<Preference
				title='Notificações Push'
				description={`Deseja receber notificações no seu ${
					isMobile ? "celular" : "computador"
				}?`}
			>
				<Toggle
					onValueChange={(e) => {
            
          }}
					defaultValue={preferences.allowPushNotifications}
				/>
			</Preference>

			<Preference
				title='Solicitações de DM'
				description='Escolha quem pode ou não te enviar DMs'
			>
				<Select
					defaultValue={preferences.allowDMRequests}
					values={preferecesMap.dmRequests.values}
					texts={preferecesMap.dmRequests.texts}
				/>
			</Preference>
		</div>
	);
}
