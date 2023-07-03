const webPush = require("web-push");

webPush.setVapidDetails(
	`mailto:${process.env.WEB_PUSH_EMAIL}`,
	process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY,
	process.env.WEB_PUSH_PRIVATE_KEY
);

export default webPush