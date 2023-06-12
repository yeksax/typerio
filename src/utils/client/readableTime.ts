export function getHHmmTime(date: Date) {
  const d = new Date(date);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export function getElapsedTime(time: number) {
	let timeString = "Há uma cota";

	if (time <= 60 * 60 * 24 * 30)
		timeString = `${Math.floor(time / 60 / 60 / 24)}d`;
	if (time <= 60 * 60 * 24) timeString = `${Math.floor(time / 60 / 60)}h`;
	if (time <= 60 * 60) timeString = `${Math.floor(time / 60)}m`;
	if (time < 60) timeString = `${Math.floor(time)}s`;

	return timeString != "Há uma cota" ? `${timeString} atrás` : "Há uma cota";
}

export function getFullDate(time: number) {
	const weekDays = [
		"dom.",
		"seg.",
		"ter.",
		"qua.",
		"qui.",
		"sex.",
		"sáb.",
	];
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