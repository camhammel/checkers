import { useDroppable } from "@dnd-kit/core";
import { useBoardContext } from "../hooks/useBoardContext";
import type { Piece as PieceType, Position } from "../types/game";
import { Piece } from "./Piece";

interface SquareProps {
    position: Position;
    piece: PieceType | null;
    onSquareClick: () => void;
    onPieceClick: () => void;
}

export function Square({
    position,
    piece,
    onSquareClick,
    onPieceClick,
}: SquareProps) {
    const { isValidMoveTarget, isSelectedPiece } = useBoardContext();
    const { row, col } = position;
    const isDarkSquare = (row + col) % 2 === 1;

    const baseClasses = "md:size-16 sm:size-12 size-8 flex items-center justify-center relative";
    const colorClasses = isDarkSquare ? "bg-gray-500" : "bg-gray-300";
    const validMoveClasses = isValidMoveTarget(row, col)
        ? "ring-2 ring-green-400 ring-inset ring-opacity-75 outline-none"
        : "";
    const selectedClasses =
        piece && isSelectedPiece(piece)
            ? "ring-2 ring-inset ring-blue-400 outline-none"
            : "";

    const { isOver, setNodeRef, active } = useDroppable({
        id: `square-${row}-${col}`,
        data: { row, col },
        disabled: !isDarkSquare,
    });

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSquareClick();
        }
    };

    if (piece) {
        return (
            <div
                ref={setNodeRef}
                className={`${baseClasses} ${colorClasses} ${validMoveClasses} ${selectedClasses} ${isOver ? "ring-2 ring-yellow-500" : ""}`}
            >
                {isSelectedPiece(piece) && active ? null : <Piece piece={piece} onClick={onPieceClick} />}
            </div>
        );
    }

    return (
        <button
            type="button"
            ref={setNodeRef}
            className={`${baseClasses} ${colorClasses} ${validMoveClasses} ${selectedClasses} ${isOver ? "ring-2 ring-yellow-500" : ""}`}
            onClick={onSquareClick}
            onKeyDown={handleKeyDown}
            aria-label={`Square ${row + 1}, ${col + 1}`}
            tabIndex={0}
        >
            {isValidMoveTarget(row, col) && (
                <div className="size-4 bg-green-400 rounded-full opacity-50" />
            )}
        </button>
    );
}
