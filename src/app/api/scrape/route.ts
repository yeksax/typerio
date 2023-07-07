import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(req: NextRequest) {
	const { url }: { url: string } = await req.json();

	try {
		const responseHtml = await (
			await fetch(url, {
				cache: "force-cache",
			})
		).text();

		const metadata: any = {},
			$ = cheerio.load(responseHtml);

		metadata.title = $('meta[name="twitter:title"]').attr("content");
		metadata.description = $('meta[name="twitter:description"]').attr(
			"content"
		);
		metadata.image = $('meta[name="twitter:image"]').attr("content");
		metadata.url = $('meta[property="og:url"]').attr("content");
		return NextResponse.json(metadata, { status: 200 });
	} catch {
		return NextResponse.json({}, { status: 503 });
	}
}
