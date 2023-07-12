"use client"

import { getElapsedTime } from "@/utils/client/readableTime";
import { useEffect, useRef, useState } from "react";

interface Props {
  time: Date
} 

export default function ElapsedTime({time}: Props) {
	const [readableTime, setReadableTime] = useState(getElapsedTime(time));
	const timer = useRef<NodeJS.Timer | null>(null);

  useEffect(() => {
		timer.current = setInterval(() => {
			setReadableTime(getElapsedTime(time));
		}, 1000);

		return () => {
			if (timer.current) clearInterval(timer.current);
		};
	}, []);

  return (
    <span className='opacity-75 w-max' suppressHydrationWarning>{readableTime}</span>
  )
}