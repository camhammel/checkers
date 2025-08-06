import { useBoardContext } from "../hooks/useBoardContext";
import type { Position } from "../types/game";
import { BOARD_SIZE, getPieceAt } from "../utils/gameLogic";
import { Square } from "./Square";

interface BoardProps {
    onSquareClick: (position: Position) => void;
    onPieceClick: (piece: import("../types/game").Piece) => void;
}

export function Board({ onSquareClick, onPieceClick }: BoardProps) {
    const { pieces } = useBoardContext();

    const renderSquare = (row: number, col: number) => {
        const position: Position = { row, col };
        const piece = getPieceAt(pieces, row, col);

        return (
            <Square
                key={`${row}-${col}`}
                position={position}
                piece={piece}
                onSquareClick={() => onSquareClick(position)}
                onPieceClick={() => piece && onPieceClick(piece)}
            />
        );
    };

    return (
        <div className="inline-block border-4 border-gray-800 bg-gray-800">
            <div className="grid grid-cols-8 gap-0">
                {Array.from({ length: BOARD_SIZE }, (_, row) =>
                    Array.from({ length: BOARD_SIZE }, (_, col) =>
                        renderSquare(row, col),
                    ),
                )}
            </div>
        </div>
    );
}
