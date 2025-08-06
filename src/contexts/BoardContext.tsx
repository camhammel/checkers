import { createContext, type ReactNode } from "react";
import type { Move, Piece, Player } from "../types/game";
import { getCurrentPlayerMoves, getValidMoves } from "../utils/gameLogic";

interface BoardContextType {
    pieces: Piece[];
    currentPlayer: Player;
    selectedPiece: Piece | null;
    validMoves: Move[];
    gameOver: boolean;
    winner: Player | null;
    hasValidMoves: (piece: Piece) => boolean;
    isSelectedPiece: (piece: Piece) => boolean;
    isValidMoveTarget: (row: number, col: number) => boolean;
    showValidMoves: boolean;
}

const BoardContext = createContext<BoardContextType | null>(null);

interface BoardProviderProps {
    children: ReactNode;
    pieces: Piece[];
    currentPlayer: Player;
    selectedPiece: Piece | null;
    validMoves: Move[];
    gameOver: boolean;
    winner: Player | null;
    showValidMoves: boolean;
}

export function BoardProvider({
    children,
    pieces,
    currentPlayer,
    selectedPiece,
    validMoves,
    gameOver,
    winner,
    showValidMoves,
}: BoardProviderProps) {
    const hasValidMoves = (piece: Piece): boolean => {
        if (gameOver || piece.player !== currentPlayer) return false;

        // Check if there are any capture moves available for the current player
        const allPlayerMoves = getCurrentPlayerMoves(pieces, currentPlayer);
        const captureMoves = allPlayerMoves.filter(
            (move) => move.captures.length > 0,
        );

        if (captureMoves.length > 0) {
            // If there are captures available, only show moves for pieces that can capture
            const pieceMoves = getValidMoves(pieces, piece);
            return pieceMoves.some((move) => move.captures.length > 0);
        } else {
            // If no captures available, show all valid moves for the piece
            const pieceMoves = getValidMoves(pieces, piece);
            return pieceMoves.length > 0;
        }
    };

    const isSelectedPiece = (piece: Piece): boolean => {
        return selectedPiece ? selectedPiece.id === piece.id : false;
    };

    const isValidMoveTarget = (row: number, col: number): boolean => {
        return validMoves.some(
            (move) => move.to.row === row && move.to.col === col,
        );
    };

    const value: BoardContextType = {
        pieces,
        currentPlayer,
        selectedPiece,
        validMoves,
        gameOver,
        winner,
        hasValidMoves,
        isSelectedPiece,
        isValidMoveTarget,
        showValidMoves,
    };

    return (
        <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
    );
}

export { BoardContext };
