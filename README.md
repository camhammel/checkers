# Take-Home Challenge: Checkers Game

## Source Code

Source code available at https://github.com/camhammel/checkers.

## Setup and Demo

This project is hosted via Github Pages at https://camhammel.github.io/checkers.
To setup this project locally, you may clone this repo and run `npm install && npm run dev`.

## Testing Instructions

Select "New Game" below the checkers board, and select a game type/opponent in order to start.
In "Self" mode, you will act as both players, whereas in "Computer" mode, a random move will be selected for player `Black`.

## Design notes and trade-offs

Included a "highlight valid moves" feature that I found beneficial when playing/testing the game.
When toggled on, all pieces with valid moves for the current player will be highlighted via a contrast in opacity.
This allows for quicker play, particularly for more inexperienced checkers players such as myself!

All captures made by the computer will be made visually within one move. This would be an opportunity for improvement
in terms of UI/UX, as ideally the user should be able to clearly see the entire transition between the two board states.

Drag-and-drop implemented via dnd-kit, a library that I was familiar with via my work with [Puck Editor](puckeditor.com).

Icons used from [hugeicons](hugeicons.com) (including favicon).

With more time, would have prioritized E2E tests and a cleaner way to sync local storage state,
e.g. via something similar to [useLocalStorage](https://vueuse.org/core/useLocalStorage/).
Admittedly, colour themes would have likely came after!

### Thank you for the opportunity 🙏
