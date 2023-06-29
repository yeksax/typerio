"use client";

import {
	ReactNode,
	createContext,
	useContext,
	useState
} from "react";

const modalContext = createContext<{
	backdropVisible: boolean;
	temporarilyHidden: boolean;
	show: () => void;
	hide: () => void;
	open: () => void;
	close: () => void;
}>({
	backdropVisible: false,
	temporarilyHidden: false,
	show: () => {},
	hide: () => {},
	open: () => {},
	close: () => {},
});

export default function ModalContextProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [backdropVisible, setBackdropVisible] = useState<boolean>(false);
	const [temporarilyHidden, setTemporarilyHidden] = useState<boolean>(false);

	function open() {
		setTemporarilyHidden(false);
		setBackdropVisible(true);
	}

	function close() {
		setTemporarilyHidden(false);
		setBackdropVisible(false);
	}

  function show() {
    setTemporarilyHidden(false);
  }

  function hide() {
    setTemporarilyHidden(true)
  }

	return (
		<modalContext.Provider
			value={{
				backdropVisible,
				temporarilyHidden,
        show,
        hide,
        open,
				close,
			}}
		>
			{children}
		</modalContext.Provider>
	);
}

export const useModal = () => useContext(modalContext);
