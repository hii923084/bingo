Sure! Here's the complete `README.md` file as a single markdown document:

```markdown
# Online Bingo Game

An online multiplayer Bingo game where players can create or join rooms, mark cells, and claim Bingo. The game is built with HTML, CSS, JavaScript, and Node.js with Socket.io for real-time communication.

## Features

- Create and join game rooms
- Real-time cell marking and turn indication
- Server-side validation of Bingo claims
- Support for diagonal, horizontal, and vertical Bingo lines

## Demo

![Bingo Game Screenshot](path/to/your/screenshot.png)

## Getting Started

### Prerequisites

- Node.js and npm installed on your machine

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/hii923084/bingo.git
   ```

2. Navigate to the project directory:

   ```bash
   cd bingo
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

### Running the Application

1. Start the server:

   ```bash
   node server.js
   ```

2. Open your browser and navigate to `http://localhost:3000`.

### Playing the Game

1. Enter a username and a room ID to create or join a room.
2. Once both players have joined, the game will start automatically.
3. Click on the cells to mark them when it's your turn.
4. Click the "Bingo!" button to claim Bingo if you have completed 5 lines.

## Project Structure

- `server.js` - The main server file
- `public/` - Contains client-side code
  - `index.html` - The main HTML file
  - `style.css` - The CSS file for styling
  - `script.js` - The client-side JavaScript file

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
