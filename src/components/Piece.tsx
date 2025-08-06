import { motion } from "motion/react";
import { useBoardContext } from "../hooks/useBoardContext";
import type { Piece as PieceType } from "../types/game";

interface PieceProps {
    piece: PieceType;
    onClick: () => void;
}

export function Piece({ piece, onClick }: PieceProps) {
    const { hasValidMoves, isSelectedPiece, showValidMoves } = useBoardContext();
    const { player, type, id } = piece;

    const baseClasses =
        "md:size-12 sm:size-9 size-6 rounded-full border-2 border-gray-800 flex items-center justify-center transition-all duration-200 cursor-pointer";
    const colorClasses = player === "red" ? "bg-red-600" : "bg-gray-800";
    const selectedClasses = isSelectedPiece(piece)
        ? "ring-4 ring-yellow-400 ring-opacity-75 shadow-lg"
        : "";
    const kingClasses = type === "king" ? "ring-2 ring-gray-200" : "";
    const validMoveStyle = showValidMoves ? hasValidMoves(piece) ? "100%" : "50%" : "unset";

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onClick();
        }
    };

    return (
        <motion.button
            type="button"
            layoutId={id}
            id={id}
            className={`${baseClasses} ${colorClasses} ${selectedClasses} ${kingClasses}`}
            onClick={onClick}
            onKeyDown={handleKeyDown}
            aria-label={`${player} ${type} piece`}
            tabIndex={0}
            style={{ opacity: validMoveStyle }}
        >
            {type === "king" && <div className="text-white font-bold text-lg">♔</div>}
        </motion.button>
    );
}
