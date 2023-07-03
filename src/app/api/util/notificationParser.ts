export function paramReplacing(str: string, params: string[] | undefined) {
	if (!params) return str;

	params.forEach((param, i) => {
		let regex = `\\$_${i}`;
		let re = new RegExp(regex, "g");
		str = str.replace(re, param);
	});

	return str;
}