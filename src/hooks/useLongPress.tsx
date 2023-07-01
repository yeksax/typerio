import { MouseEvent, useCallback, useRef, useState } from "react";

const useLongPress = (
	onLongPress: (event: Event) => void,
	onClick: (event?: MouseEvent) => void,
	{ shouldPreventDefault = true, delay = 300 } = {}
) => {
	const [longPressTriggered, setLongPressTriggered] = useState(false);
	const timeout = useRef<NodeJS.Timeout>();
	const target = useRef<HTMLElement | null>(null);

	const start = useCallback(
		(event: Event) => {
			if (shouldPreventDefault && event.target) {
				event.target.addEventListener("touchend", preventDefault, {
					passive: false,
				});
				target.current = event.target as HTMLElement;
			}
			timeout.current = setTimeout(() => {
				onLongPress(event);
				setLongPressTriggered(true);
			}, delay);
		},
		[onLongPress, delay, shouldPreventDefault]
	);

	const clear = useCallback(
		(event: Event, shouldTriggerClick = true) => {
			timeout.current && clearTimeout(timeout.current);
			shouldTriggerClick && !longPressTriggered && onClick();
			setLongPressTriggered(false);
			if (shouldPreventDefault && target.current) {
				target.current.removeEventListener("touchend", preventDefault);
			}
		},
		[shouldPreventDefault, onClick, longPressTriggered]
	);

	return {
		onMouseDown: (e) => start(e),
		onTouchStart: (e) => start(e),
		onMouseUp: (e) => clear(e),
		onMouseLeave: (e) => clear(e, false),
		onTouchEnd: (e) => clear(e),
	};
};

const isTouchEvent = (event: Event) => {
	return "touches" in event;
};

const preventDefault = (event: Event) => {
	if (!isTouchEvent(event)) return;

	if (event.touches.length < 2 && event.preventDefault) {
		event.preventDefault();
	}
};

export default useLongPress;