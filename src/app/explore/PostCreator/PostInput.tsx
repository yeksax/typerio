'use client'

import { User } from "@prisma/client";

export default function CreatorInput({ user }: { user: User }) {
  function resize(e: any) {
    e.target.style.height = "1lh";
    e.target.style.height = e.target.scrollHeight + "px";
	}
  
	return (
		<textarea
			onChange={resize}
      name="content"
			className='resize-none box-content outline-none text-sm typer-scroll'
			placeholder={`O que ${user.name} anda pensando?`}
			style={{
				height: "1lh",
				maxHeight: "4lh",
			}}
		></textarea>
	);
}
