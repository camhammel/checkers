import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
} from "@dnd-kit/core";
import { useCallback, useEffect, useState } from "react";
import { BoardProvider } from "../contexts/BoardContext";
import type { Move, Piece, Player, Position } from "../types/game";
import {
    executeComputerMove,
    getComputerMove,
    getCurrentPlayerMoves,
    getValidMoves,
    initializeBoard,
    isGameOver,
    makeMove,
} from "../utils/gameLogic";
import { Board } from "./Board";
import { GameModeModal } from "./GameModeModal";
import { Piece as PieceComponent } from "./Piece";

const LOCAL_STORAGE_GAME_KEY = "gameState";

export function Game() {
    const [pieces, setPieces] = useState<Piece[]>([]);
    const [currentPlayer, setCurrentPlayer] = useState<Player>("red");
    const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
    const [validMoves, setValidMoves] = useState<Move[]>([]);
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState<Player | null>(null);
    const [showValidMoves, setShowValidMoves] = useState(true);
    const [gameMode, setGameMode] = useState<"human" | "computer" | null>(null);
    const [showGameModeModal, setShowGameModeModal] = useState(false);
    const [isComputerThinking, setIsComputerThinking] = useState(false);

    const [, setDraggingPieceId] = useState<string | null>(null);

    const pointerSensor = useSensor(PointerSensor, {
        activationConstraint: {
            distance: 5,
        },
    });

    useEffect(() => {
        // load game state from local storage
        const storedGameState = localStorage.getItem(LOCAL_STORAGE_GAME_KEY);
        if (storedGameState) {
            const gameState = JSON.parse(storedGameState);
            setPieces(gameState.pieces);
            setCurrentPlayer(gameState.currentPlayer);
            setSelectedPiece(gameState.selectedPiece);
            setGameMode(gameState.gameMode || "human");
        }

        return () => {
            localStorage.clear();
        };
    }, []);

    // Check for game over conditions
    useEffect(() => {
        const { gameOver: isOver, winner: gameWinner } = isGameOver(
            pieces,
            currentPlayer,
        );
        setGameOver(isOver);
        setWinner(gameWinner);
        if (isOver) {
            // clear local storage
            localStorage.clear();
            setGameMode(null);
        }
    }, [pieces, currentPlayer]);

    // Get valid moves for selected piece
    useEffect(() => {
        if (selectedPiece) {
            const captures = getCurrentPlayerMoves(pieces, currentPlayer).filter(
                (move) => move.captures.length > 0,
            );
            const moves = getValidMoves(pieces, selectedPiece);
            // If there are captures available, only show the captures for the selected piece
            if (captures.length > 0) {
                setValidMoves(moves.filter((move) => move.captures.length > 0));
            } else {
                setValidMoves(moves);
            }
        } else {
            setValidMoves([]);
        }

        // save game state to local storage
        localStorage.setItem(
            LOCAL_STORAGE_GAME_KEY,
            JSON.stringify({
                pieces,
                currentPlayer,
                selectedPiece,
                gameMode,
            }),
        );
    }, [selectedPiece, pieces, currentPlayer, gameMode]);

    const handlePieceClick = (piece: Piece, allowToggle: boolean = true) => {
        if (gameOver) return;

        // Prevent human moves during computer's turn
        if (gameMode === "computer" && currentPlayer === "black") return;

        // Only allow selecting pieces of the current player
        if (piece.player !== currentPlayer) return;

        // If clicking the same piece, deselect it
        if (allowToggle && selectedPiece && selectedPiece.id === piece.id) {
            setSelectedPiece(null);
            setValidMoves([]);
        } else {
            setSelectedPiece(piece);
        }
    };

    const handleSquareClick = (position: Position) => {
        if (gameOver || !selectedPiece) return;

        // Prevent human moves during computer's turn
        if (gameMode === "computer" && currentPlayer === "black") return;

        // Check if this is a valid move for the selected piece
        const move = validMoves.find(
            (m) => m.to.row === position.row && m.to.col === position.col,
        );

        if (move) {
            // Make the move
            const newPieces = makeMove(pieces, move);
            setPieces(newPieces);

            // if this move was a capture, check if there are any sequential captures available for that piece in its new position
            let additionalCaptures = false;
            if (move.captures.length > 0) {
                // find the piece in the new position
                const piece = newPieces.find(
                    (piece) => piece.row === move.to.row && piece.col === move.to.col,
                );
                if (piece) {
                    const captures = getValidMoves(newPieces, piece).filter(
                        (move) => move.captures.length > 0,
                    );

                    // update the selected piece to the new position and set valid moves to available captures
                    if (captures.length > 0) {
                        setSelectedPiece(piece);
                        setValidMoves(captures);
                        additionalCaptures = true;
                    }
                }
            }

            if (!additionalCaptures) {
                // Clear selection
                setSelectedPiece(null);
                setValidMoves([]);

                // Switch players
                setCurrentPlayer(currentPlayer === "red" ? "black" : "red");
            }
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        // Prevent dragging during computer's turn
        if (gameMode === "computer" && currentPlayer === "black") return;

        const pieceId = event.active.id as string;
        setDraggingPieceId(pieceId);
        const piece = pieces.find((p) => p.id === pieceId);
        if (piece) {
            handlePieceClick(piece, false);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setDraggingPieceId(null);
        const over = event.over;

        if (!over) return;
        const data = over.data?.current as
            | { row?: number; col?: number }
            | undefined;
        if (!data || typeof data.row !== "number" || typeof data.col !== "number")
            return;
        handleSquareClick({ row: data.row, col: data.col });
    };

    const resetGame = () => {
        setShowGameModeModal(true);
    };

    const startNewGame = (mode: "human" | "computer") => {
        setGameMode(mode);
        setPieces(initializeBoard());
        setCurrentPlayer("red");
        setSelectedPiece(null);
        setValidMoves([]);
        setGameOver(false);
        setWinner(null);
        setShowGameModeModal(false);
    };

    const executeComputerMoveWithCaptures = useCallback((currentPieces: Piece[], player: Player) => {
        let pieces = [...currentPieces];
        let hasMoreCaptures = true;
        let captureCount = 0;
        const maxCaptures = 10; // Prevent infinite loops

        // Execute moves until no more captures are available
        while (hasMoreCaptures && captureCount < maxCaptures) {
            const computerMove = getComputerMove(pieces, player);

            if (!computerMove) {
                break;
            }

            const { newPieces, hasAdditionalCaptures } = executeComputerMove(pieces, computerMove);
            pieces = newPieces;

            if (!hasAdditionalCaptures) {
                hasMoreCaptures = false;
            }

            captureCount++;
        }

        // Update the game state with the final board
        setPieces(pieces);

        // Switch to human player
        setCurrentPlayer("red");
        setSelectedPiece(null);
        setValidMoves([]);
        setIsComputerThinking(false);
    }, []);

    const handleComputerMove = useCallback(() => {
        if (gameMode !== "computer" || currentPlayer !== "black" || gameOver)
            return;

        setIsComputerThinking(true);

        // Add a small delay to make the computer move visible
        setTimeout(() => {
            // Execute computer move with potential sequential captures
            executeComputerMoveWithCaptures(pieces, currentPlayer);
        }, 500);
    }, [gameMode, currentPlayer, gameOver, pieces, executeComputerMoveWithCaptures]);

    // Handle computer moves when it's computer's turn
    useEffect(() => {
        if (
            gameMode === "computer" &&
            currentPlayer === "black" &&
            !gameOver &&
            !isComputerThinking
        ) {
            handleComputerMove();
        }
    }, [
        currentPlayer,
        gameMode,
        gameOver,
        isComputerThinking,
        handleComputerMove,
    ]);

    return (
        <div className="flex flex-col items-center gap-6 p-8">
            <h1 className="text-4xl font-bold text-gray-800">Checkers</h1>

            {/* Game Status */}
            <div className="text-center">
                {gameOver ? (
                    <div className="mb-4">
                        <h2 className="text-2xl font-bold text-green-600">
                            Game Over!{" "}
                            {winner
                                ? `${winner.charAt(0).toUpperCase() + winner.slice(1)} wins!`
                                : "Draw!"}
                        </h2>
                    </div>
                ) : (
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">
                            Current Player:
                            <span
                                className={`ml-2 px-3 py-1 rounded-full text-white ${currentPlayer === "red" ? "bg-red-600" : "bg-gray-800"
                                    }`}
                            >
                                {currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}
                            </span>
                        </h2>
                    </div>
                )}
            </div>

            {/* Game Board */}
            <BoardProvider
                pieces={pieces}
                currentPlayer={currentPlayer}
                selectedPiece={selectedPiece}
                validMoves={validMoves}
                gameOver={gameOver}
                winner={winner}
                showValidMoves={showValidMoves}
            >
                <DndContext
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    sensors={[pointerSensor]}
                >
                    <Board
                        onSquareClick={handleSquareClick}
                        onPieceClick={handlePieceClick}
                    />
                    <DragOverlay dropAnimation={null}>
                        {selectedPiece && (
                            <PieceComponent
                                piece={selectedPiece}
                                onClick={() => { }}
                                activeDrag
                            />
                        )}
                    </DragOverlay>
                </DndContext>
            </BoardProvider>

            {/* Reset Button */}
            <button
                type="button"
                onClick={resetGame}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
                New Game
            </button>
            {/* Toggle Valid Moves Toggle */}
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={showValidMoves}
                    onChange={() => setShowValidMoves(!showValidMoves)}
                    className="size-6"
                />
                <label htmlFor="showValidMoves" className="text-sm text-gray-800">
                    Highlight Valid Moves
                </label>
            </div>

            {/* Game Mode Modal */}
            <GameModeModal
                isOpen={showGameModeModal}
                onClose={() => setShowGameModeModal(false)}
                onGameModeSelect={startNewGame}
            />
        </div>
    );
}
