import { ReactNode } from "react";
import xss, { FilterXSS } from "xss";

interface Props {
	children: string;
}

export function Linkify({ children }: Props) {
	let urls = 0;
	let wordCount = 0;
	let urlsData: {
		toBeReplaced: string;
		toReplace: string;
	}[] = [];
	let foundURLs: string[] = [];

	function isURL(word: string) {
		const urlPattern =
			/^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/g;
		return word.match(urlPattern);
	}

	function locateURLs(word: string) {
		if (isURL(word)) {
			if (foundURLs.filter((url) => url === word).length > 1) return;
			else foundURLs.push(word);

			let url = new URL(word);
			let readableURL = `${url.hostname}${url.pathname}`;
			if (readableURL.length > 32) {
				readableURL = readableURL.slice(0, 29) + "...";
			}

			let markup: string;

			if (urls === 0 && wordCount != 1) {
				markup = "";
			} else {
				markup = `<a target='_blank' rel='noreferrer' class="hover:underline underline-offset-2 transition-all text-blue-600 break-all text-ellipsis  dark:text-blue-400" href="${word}">${readableURL}</a>`;
			}

			urlsData.push({
				toBeReplaced: word,
				toReplace: markup,
			});

			urls += 1;
		}

		return word;
	}

	const words = children.split(/[\s]+/);
	words.forEach((w) => locateURLs(w));

	wordCount = words.length;

	// @ts-expect-error
	const xssFilter = new xss.FilterXSS({
		whiteList: {
			a: ["href", "title", "target", "class", "rel"],
		},
	} as FilterXSS);

	urlsData.forEach((url) => {
		children = children.replace(url.toBeReplaced, url.toReplace)
	});

	const html = xssFilter.process(children.trim());

	return (
		<pre
			className='text-sm mt-0.5 break-all whitespace-pre-wrap'
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	);
}
