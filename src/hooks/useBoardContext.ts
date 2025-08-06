import { useContext } from "react";
import { BoardContext } from "../contexts/BoardContext";

export function useBoardContext() {
	const context = useContext(BoardContext);
	if (!context) {
		throw new Error("useBoardContext must be used within a BoardProvider");
	}
	return context;
}
