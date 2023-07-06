"use client";

import { File } from "@prisma/client";
import PostImage from "./PostImage";

interface Props {
	files: File[];
}

export default function PostGrid({ files }: Props) {
	return (
		<div
			className={`w-full place-items-center grid gap-1 mt-1 h-fit grid-flow-row ${
				files.length > 1 ? "grid-cols-2" : ""
			}`}
		>
			{files.map((file, i) => (
				<PostImage
					file={file}
					key={file.id}
					colspan={files.length === 3 && i === 2}
				/>
			))}
		</div>
	);
}
