import { useDraggable } from "@dnd-kit/core";
import { useBoardContext } from "../hooks/useBoardContext";
import type { Piece as PieceType } from "../types/game";

interface PieceProps {
    piece: PieceType;
    onClick: () => void;
    activeDrag?: boolean;
}

export function Piece({ piece, onClick, activeDrag }: PieceProps) {
    const {
        hasValidMoves,
        isSelectedPiece,
        showValidMoves,
        currentPlayer,
        gameOver,
    } = useBoardContext();
    const { player, type, id } = piece;

    const { attributes, listeners, setNodeRef, transform } =
        useDraggable({
            id,
            data: { pieceId: id },
            disabled: gameOver || player !== currentPlayer,
        });

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onClick();
        }
    };

    const baseClasses =
        "md:size-12 sm:size-9 size-6 rounded-full border-2 border-gray-800 flex items-center justify-center transition-all duration-200 cursor-pointer";
    const colorClasses = player === "red" ? "bg-red-600" : "bg-gray-800";
    const selectedClasses = isSelectedPiece(piece)
        ? "ring-4 ring-yellow-400 ring-opacity-75 shadow-lg"
        : "";
    const kingClasses = type === "king" ? "ring-2 ring-gray-200" : "";
    const validMoveStyle = showValidMoves
        ? hasValidMoves(piece)
            ? "100%"
            : "50%"
        : "unset";
    const draggingClasses = activeDrag
        ? "cursor-grabbing drop-shadow-lg shadow-black"
        : "";

    return (
        <button
            type="button"
            id={id}
            className={`${baseClasses} ${colorClasses} ${selectedClasses} ${kingClasses} ${draggingClasses}`}
            onClick={onClick}
            onKeyDown={handleKeyDown}
            aria-label={`${player} ${type} piece`}
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={{
                opacity: validMoveStyle,
                transform: transform
                    ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
                    : activeDrag
                        ? "translate3d(-2px, -2px, 0px) skewY(-5deg) rotate(-5deg) scale(.95)"
                        : undefined,
                zIndex: activeDrag ? 50 : undefined,
                touchAction: "none",
                willChange: activeDrag ? "transform" : undefined,
            }}
        >
            {type === "king" && <div className="text-white font-bold text-lg">♔</div>}
        </button>
    );
}
