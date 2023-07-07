import { ReactNode } from "react";

interface Props {
	children: ReactNode;
}

export function Linkify({ children }: Props) {
	let urls = 0;
	let wordCount = 0;

	const isUrl = (word: string) => {
		const urlPattern =
			/^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/g;
		return word.match(urlPattern);
	};

	const addMarkup = (word: string) => {
		if (isUrl(word)) {
			let url = new URL(word);
			let readableURL = `${url.hostname}${url.pathname}`;
			if (readableURL.length > 32) {
				readableURL = readableURL.slice(0, 29) + "...";
			}

			let markup: string;
			if (urls === 0 && wordCount != 1) {
				markup = "";
			} else {
				markup = `<a target='_blank' rel='noreferrer' class="text-blue-600 break-all text-ellipsis  dark:text-blue-400" href="${word}">${readableURL}</a>`;
			}

			urls++;
			return markup;
		}

		return word;
	};

	const words = (children as string).split(/[\s]+/);
	wordCount = words.length;
	const formatedWords = words.map((w, i) => addMarkup(w));

	const html = formatedWords.join(" ");

	return (
		<pre
			className='text-sm mt-0.5 break-words whitespace-pre-wrap cursor-pointer'
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	);
}
