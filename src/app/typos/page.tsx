import { useChat } from "@/contexts/ChatContext";

// export const metadata = {
// 	title: "TYPER.IO",
// 	description: "TYPER.IO: Compartilhe suas palavras de forma minimalista e impactante.",
// };

export const metadata = {
	title: "Chats",
};

export default function Chat() {
	return (
		<div className='grid place-items-center flex-1'>
			<div className='flex flex-col gap-4 justify-center items-center'>
				<h1 className='text-4xl font-bold'>Que tal começar um chat?</h1>
				<span className='text-xl'>
					vai ficar querendo pq ainda nao ta feito
				</span>
			</div>
		</div>
	);
}
