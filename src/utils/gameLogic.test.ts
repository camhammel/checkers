import { expect, test } from "vitest";
import {
	getCurrentPlayerMoves,
	getPieceAt,
	getValidMoves,
	initializeBoard,
	isGameOver,
	isValidPosition,
	makeMove,
} from "./gameLogic";

const makeCaptureMove = () => {
	let pieces = initializeBoard();
	const blackPiece = pieces.find((p) => p.row === 2 && p.col === 5);
	let redPiece = pieces.find((p) => p.row === 5 && p.col === 2);
	if (!blackPiece || !redPiece) throw new Error("Piece not found");

	const firstMove = getValidMoves(pieces, redPiece)[1];
	pieces = makeMove(pieces, firstMove);
	const secondMove = getValidMoves(pieces, blackPiece)[0];
	pieces = makeMove(pieces, secondMove);

	redPiece = pieces.find((piece) => piece.id === redPiece?.id);
	if (!redPiece) throw new Error("Piece not found");

	return { pieces, blackPiece, redPiece };
};

test("initializes board on 8x8 grid with 24 pieces", () => {
	const pieces = initializeBoard();
	expect(pieces.length).toBe(24);
	expect(
		pieces.every(
			(piece) =>
				piece.row >= 0 && piece.row < 8 && piece.col >= 0 && piece.col < 8,
		),
	).toBe(true);
});

test("getPieceAt returns null if no piece at position", () => {
	const pieces = initializeBoard();
	expect(getPieceAt(pieces, 0, 0)).toBeNull();
});

test("getPieceAt returns piece at position", () => {
	const pieces = initializeBoard();
	const piece = getPieceAt(pieces, 1, 0);
	expect(piece).not.toBeNull();
	expect(piece?.row).toBe(1);
	expect(piece?.col).toBe(0);
});

test("isValidPosition returns true for valid positions", () => {
	expect(isValidPosition(0, 1)).toBe(true);
	expect(isValidPosition(5, 0)).toBe(true);
});

test("isValidPosition returns false for invalid positions", () => {
	// outside of board
	expect(isValidPosition(-1, 0)).toBe(false);
	expect(isValidPosition(0, -1)).toBe(false);
	expect(isValidPosition(8, 0)).toBe(false);
	expect(isValidPosition(0, 8)).toBe(false);

	// light squares
	expect(isValidPosition(0, 0)).toBe(false);
	expect(isValidPosition(0, 2)).toBe(false);
	expect(isValidPosition(2, 0)).toBe(false);
	expect(isValidPosition(2, 2)).toBe(false);
});

test("getValidMoves returns empty array if no moves available", () => {
	const pieces = initializeBoard();
	const piece = pieces[0];
	expect(getValidMoves(pieces, piece)).toEqual([]);
});

test("getValidMoves returns regular moves if no capture moves available", () => {
	const pieces = initializeBoard();
	const piece = pieces.find((p) => p.row === 2 && p.col === 1);
	if (!piece) {
		throw new Error("Piece not found");
	}
	expect(getValidMoves(pieces, piece)).toContainEqual({
		from: { row: 2, col: 1 },
		to: { row: 3, col: 0 },
		captures: [],
	});
});

test("getValidMoves returns capture moves if available", () => {
	const { pieces, redPiece } = makeCaptureMove();

	const validMoves = getValidMoves(pieces, redPiece);
	expect(validMoves).toHaveLength(1);
	expect(validMoves[0].to.row).toBe(2);
	expect(validMoves[0].to.col).toBe(5);
});

test("makeMove returns updated pieces, including moved piece", () => {
	const pieces = initializeBoard();
	const piece = pieces.find((p) => p.row === 2 && p.col === 5);
	if (!piece) {
		throw new Error("Piece not found");
	}
	const move = getValidMoves(pieces, piece)[0];
	if (!move) {
		throw new Error("Move not found");
	}
	const newPieces = makeMove(pieces, move);
	expect(newPieces).toHaveLength(pieces.length);
	expect(
		newPieces.some((p) => p.row === move.to.row && p.col === move.to.col),
	).toBe(true);
	expect(
		newPieces.some((p) => p.row === piece.row && p.col === piece.col),
	).toBe(false);
});

test("makeMove returns updated pieces, excluding captured piece", () => {
	const { pieces, redPiece } = makeCaptureMove();
	const validMoves = getValidMoves(pieces, redPiece);
	expect(validMoves).toHaveLength(1);
	expect(validMoves[0].captures).toHaveLength(1);
	const captureMove = validMoves[0];

	const newPieces = makeMove(pieces, captureMove);
	expect(newPieces).toHaveLength(23);
});

test("getCurrentPlayerMoves returns all available moves if no capture moves available", () => {
	const pieces = initializeBoard();
	const moves = getCurrentPlayerMoves(pieces, "red");
	expect(moves).toHaveLength(7);
	expect(moves.every((move) => move.captures.length === 0)).toBe(true);
});

test("getCurrentPlayerMoves returns exclusively capture moves if available", () => {
	const { pieces } = makeCaptureMove();
	const moves = getCurrentPlayerMoves(pieces, "red");
	expect(moves).toHaveLength(1);
	expect(moves[0].captures).toHaveLength(1);
});

test("isGameOver returns true if one player has no pieces left", () => {
	const pieces: ReturnType<typeof initializeBoard> = [
		{
			id: "1",
			row: 0,
			col: 0,
			player: "black",
			type: "king",
		},
	];
	expect(isGameOver(pieces, "red")).toEqual({
		gameOver: true,
		winner: "black",
	});
});

test("isGameOver returns true if current player has no valid moves", () => {
	const pieces: ReturnType<typeof initializeBoard> = [
		{
			id: "1",
			row: 0,
			col: 1,
			player: "black",
			type: "normal",
		},
		{
			id: "2",
			row: 0,
			col: 3,
			player: "black",
			type: "normal",
		},
		{
			id: "3",
			row: 1,
			col: 2,
			player: "red",
			type: "normal",
		},
	];
	const moves = getCurrentPlayerMoves(pieces, "red");
	expect(moves).toHaveLength(0);
	expect(isGameOver(pieces, "red")).toEqual({
		gameOver: true,
		winner: "black",
	});
});

test("isGameOver returns false if game is not over", () => {
	const pieces = initializeBoard();
	expect(isGameOver(pieces, "red")).toEqual({
		gameOver: false,
		winner: null,
	});
});
