export function getHHmmTime(date: Date) {
	const d = new Date(date);
	return `${d.getHours().toString().padStart(2, "0")}:${d
		.getMinutes()
		.toString()
		.padStart(2, "0")}`;
}

export function getmssTime(date: Date) {
	const d = new Date(date);
	return `${d.getMinutes().toString().padStart(1, "0")}:${d
		.getSeconds()
		.toString()
		.padStart(2, "0")}`;
}

export function getElapsedTime(d: string | Date | number, includeAtras = true) {
	let timeString = "Há uma cota";
	let time = new Date(d).getTime();
	let now = new Date().getTime()
	time = (now - time) / 1000;

	if (time >= 60 * 60 * 24 * 7)
		timeString = `${Math.floor(time / 60 / 60 / 24 / 7)}sem.`;
	if (time <= 60 * 60 * 24 * 7)
		timeString = `${Math.floor(time / 60 / 60 / 24)}d`;
	if (time <= 60 * 60 * 24) timeString = `${Math.floor(time / 60 / 60)}h`;
	if (time <= 60 * 60) timeString = `${Math.floor(time / 60)}min`;
	if (time < 60) timeString = `${Math.floor(time)}s`;

	return timeString != "Há uma cota"
		? `${timeString}${includeAtras ? " atrás" : ""}`
		: "Há uma cota";
}

export function getFullDate(time: number | Date) {
	const weekDays = ["dom.", "seg.", "ter.", "qua.", "qui.", "sex.", "sáb."];
	const yearMonths = [
		"jan.",
		"fev.",
		"mar.",
		"abr.",
		"mai.",
		"jun.",
		"jul.",
		"ago.",
		"set.",
		"out.",
		"nov.",
		"dez.",
	];

	let date = new Date(time);

	let weekDay = date.getDay();
	let day = date.getDate();
	let month = date.getMonth();
	let year = date.getFullYear();
	let hour = date.getHours();
	let minute = date.getMinutes();

	return `${weekDays[weekDay]}, ${day} de ${yearMonths[month]}, ${year} às ${hour}:${minute}`;
}

export function getTimeSince(start: Date) {
	const now = new Date().getTime();
	const timeDifference = (now - new Date(start).getTime()) / 1000;

	return getElapsedTime(timeDifference, false);
}

const months = [
	"Janeiro",
	"Fevereiro",
	"Março",
	"Abril",
	"Maio",
	"Junho",
	"Julho",
	"Agosto",
	"Setembro",
	"Outubro",
	"Novembro",
	"Dezembro",
];

export function getJoinDate(date: Date) {
	let str = "Entrou em ";
	let d = new Date(date);
	str += months[d.getMonth()].toLowerCase();
	str += ` de ${d.getFullYear()}`;

	return str;
}
