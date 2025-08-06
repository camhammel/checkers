export type Player = "red" | "black";
export type PieceType = "normal" | "king";

export interface Piece {
	id: string;
	player: Player;
	type: PieceType;
	row: number;
	col: number;
}

export interface Position {
	row: number;
	col: number;
}

export interface Move {
	from: Position;
	to: Position;
	captures: Position[];
}

export interface GameState {
	pieces: Piece[];
	currentPlayer: Player;
	selectedPiece: Piece | null;
	validMoves: Move[];
	gameOver: boolean;
	winner: Player | null;
}
