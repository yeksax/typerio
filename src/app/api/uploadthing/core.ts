import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
	// Define as many FileRoutes as you like, each with a unique routeSlug
	audioUploader: f({ blob: { maxFileSize: "4MB" } }).onUploadComplete(
		async ({ metadata, file }) => {
			// This code RUNS ON YOUR SERVER after upload
		}
	),
	userImageUploader: f({ blob: { maxFileSize: "4MB" } }).onUploadComplete(
		async ({ metadata, file }) => {
			// This code RUNS ON YOUR SERVER after upload
		}
	),
	postFileUploader: f({ blob: { maxFileCount: 4 } }).onUploadComplete(
		async ({ metadata, file }) => {
			// This code RUNS ON YOUR SERVER after upload
		}
	),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
