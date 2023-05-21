'use client'

import { FormEvent } from "react";

export default function Submit() {	
	function resetForm(e: any) {
		console.log(e)
	}

	return (
		<button
			onClick={resetForm}
			type='submit'
			className='bg-black text-white px-2 border-2 border-black py-1 rounded-md text-xs hover:bg-white hover:text-black hover:font-bold transition-all'
		>
			Enviar
		</button>
	);
}
