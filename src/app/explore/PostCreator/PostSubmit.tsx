'use client'

import { MouseEvent } from "react";


export default function Submit() {	
	return (
		<button
			type='submit'
			className='bg-black text-white px-2 border-2 border-black py-1 rounded-md text-xs hover:bg-white hover:text-black hover:font-bold transition-all'
		>
			Enviar
		</button>
	);
}
