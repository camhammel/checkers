import type { Move, Piece, Player } from "../types/game";

export const BOARD_SIZE = 8;

export function initializeBoard(): Piece[] {
	const pieces: Piece[] = [];
	let id = 0;

	// Place black pieces (top 3 rows)
	for (let row = 0; row < 3; row++) {
		for (let col = 0; col < BOARD_SIZE; col++) {
			if ((row + col) % 2 === 1) {
				pieces.push({
					id: `piece-${id++}`,
					player: "black",
					type: "normal",
					row,
					col,
				});
			}
		}
	}

	// Place red pieces (bottom 3 rows)
	for (let row = 5; row < BOARD_SIZE; row++) {
		for (let col = 0; col < BOARD_SIZE; col++) {
			if ((row + col) % 2 === 1) {
				pieces.push({
					id: `piece-${id++}`,
					player: "red",
					type: "normal",
					row,
					col,
				});
			}
		}
	}

	return pieces;
}

export function getPieceAt(
	pieces: Piece[],
	row: number,
	col: number,
): Piece | null {
	return pieces.find((piece) => piece.row === row && piece.col === col) || null;
}

export function isValidPosition(row: number, col: number): boolean {
	return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

export function getValidMoves(pieces: Piece[], piece: Piece): Move[] {
	// Get all possible moves for this piece
	const possibleMoves = getPossibleMoves(pieces, piece);

	// Check if there are any capture moves available
	const captureMoves = possibleMoves.filter((move) => move.captures.length > 0);

	// If there are capture moves, only return those (mandatory captures)
	if (captureMoves.length > 0) {
		return captureMoves;
	}

	// Otherwise return regular moves
	return possibleMoves.filter((move) => move.captures.length === 0);
}

function getPossibleMoves(pieces: Piece[], piece: Piece): Move[] {
	const moves: Move[] = [];
	const { row, col, player } = piece;

	// Define directions based on piece type and player
	const directions = getDirections(piece);

	// Check regular moves
	for (const [dRow, dCol] of directions) {
		const newRow = row + dRow;
		const newCol = col + dCol;

		if (
			isValidPosition(newRow, newCol) &&
			!getPieceAt(pieces, newRow, newCol)
		) {
			moves.push({
				from: { row, col },
				to: { row: newRow, col: newCol },
				captures: [],
			});
		}
	}

	// Check capture moves
	for (const [dRow, dCol] of directions) {
		const jumpRow = row + dRow * 2;
		const jumpCol = col + dCol * 2;
		const captureRow = row + dRow;
		const captureCol = col + dCol;

		if (
			isValidPosition(jumpRow, jumpCol) &&
			isValidPosition(captureRow, captureCol)
		) {
			const capturePiece = getPieceAt(pieces, captureRow, captureCol);
			const jumpSquare = getPieceAt(pieces, jumpRow, jumpCol);

			if (capturePiece && capturePiece.player !== player && !jumpSquare) {
				moves.push({
					from: { row, col },
					to: { row: jumpRow, col: jumpCol },
					captures: [{ row: captureRow, col: captureCol }],
				});
			}
		}
	}

	return moves;
}

function getDirections(piece: Piece): [number, number][] {
	const { player, type } = piece;

	if (type === "king") {
		// Kings can move in all diagonal directions
		return [
			[-1, -1],
			[-1, 1],
			[1, -1],
			[1, 1],
		];
	} else {
		// Normal pieces can only move forward
		return player === "red"
			? [
					[-1, -1],
					[-1, 1],
				]
			: [
					[1, -1],
					[1, 1],
				];
	}
}

export function makeMove(pieces: Piece[], move: Move): Piece[] {
	const newPieces = pieces.filter(
		(piece) =>
			!(piece.row === move.from.row && piece.col === move.from.col) &&
			!move.captures.some(
				(capture) => piece.row === capture.row && piece.col === capture.col,
			),
	);

	// Find the piece being moved
	const movingPiece = pieces.find(
		(piece) => piece.row === move.from.row && piece.col === move.from.col,
	);

	if (!movingPiece) return pieces;

	// Create the moved piece
	const movedPiece: Piece = {
		...movingPiece,
		row: move.to.row,
		col: move.to.col,
	};

	// Check if piece should be kinged
	if (shouldKing(movedPiece)) {
		movedPiece.type = "king";
	}

	return [...newPieces, movedPiece];
}

function shouldKing(piece: Piece): boolean {
	if (piece.type === "king") return false;

	return (
		(piece.player === "red" && piece.row === 0) ||
		(piece.player === "black" && piece.row === BOARD_SIZE - 1)
	);
}

export function getCurrentPlayerMoves(
	pieces: Piece[],
	currentPlayer: Player,
): Move[] {
	const playerPieces = pieces.filter((piece) => piece.player === currentPlayer);
	const allMoves: Move[] = [];
	const allCaptures: Move[] = [];

	for (const piece of playerPieces) {
		const moves = getValidMoves(pieces, piece);
		if (moves.some((move) => move.captures.length > 0)) {
			allCaptures.push(...moves.filter((move) => move.captures.length > 0));
		} else {
			allMoves.push(...moves);
		}
	}

	return allCaptures.length > 0 ? allCaptures : allMoves;
}

export function isGameOver(
	pieces: Piece[],
	currentPlayer: Player,
): { gameOver: boolean; winner: Player | null } {
	const redPieces = pieces.filter((piece) => piece.player === "red");
	const blackPieces = pieces.filter((piece) => piece.player === "black");

	// Check if one player has no pieces left
	if (redPieces.length === 0) {
		return { gameOver: true, winner: "black" };
	}
	if (blackPieces.length === 0) {
		return { gameOver: true, winner: "red" };
	}

	// Check if current player has no valid moves
	const currentPlayerMoves = getCurrentPlayerMoves(pieces, currentPlayer);
	if (currentPlayerMoves.length === 0) {
		const winner = currentPlayer === "red" ? "black" : "red";
		return { gameOver: true, winner };
	}

	return { gameOver: false, winner: null };
}
