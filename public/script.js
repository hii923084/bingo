const socket = io();

document.addEventListener('DOMContentLoaded', () => {
    const login = document.getElementById('login');
    const game = document.getElementById('game');
    const usernameInput = document.getElementById('username');
    const roomIdInput = document.getElementById('room-id');
    const createRoomButton = document.getElementById('create-room');
    const joinRoomButton = document.getElementById('join-room');
    const bingoBoard = document.getElementById('bingo-board');
    const turnIndicator = document.getElementById('turn-indicator');
    const bingoButton = document.getElementById('bingo-button');

    let playerIndex = null;
    let boards = [];
    let currentPlayerTurn = null;

    createRoomButton.addEventListener('click', () => {
        const username = usernameInput.value;
        const roomId = roomIdInput.value;
        if (username && roomId) {
            socket.emit('create-room', { roomId, username });
        } else {
            alert('Please enter both username and room ID.');
        }
    });

    joinRoomButton.addEventListener('click', () => {
        const username = usernameInput.value;
        const roomId = roomIdInput.value;
        if (username && roomId) {
            socket.emit('join-room', { roomId, username });
        } else {
            alert('Please enter both username and room ID.');
        }
    });

    bingoButton.addEventListener('click', () => {
        if (playerIndex !== null) {
            const markedCells = Array.from(document.querySelectorAll('.bingo-cell')).map(cell => cell.classList.contains('selected'));
            socket.emit('bingo', { roomId: roomIdInput.value, playerIndex, board: boards[playerIndex], markedCells });
        } 
    });

    socket.on('room-created', ({ roomId, board, playerIndex: index, turn }) => {
        login.style.display = 'none';
        game.style.display = 'block';
        playerIndex = index;
        boards[playerIndex] = board;
        currentPlayerTurn = turn;
        renderBoard(board);
        updateTurnIndicator(turn);
    });

    socket.on('start-game', ({ boards: serverBoards, turn }) => {
        login.style.display = 'none';
        game.style.display = 'block';
        if (playerIndex !== null) {
            boards = serverBoards;
            renderBoard(boards[playerIndex]);
            currentPlayerTurn = turn;
            updateTurnIndicator(turn);
        }
    });

    socket.on('cell-marked', ({ cellIndex, number, playerIndex: markerIndex }) => {
        const cells = document.querySelectorAll('.bingo-cell');
        cells.forEach((cell) => {
            if (parseInt(cell.textContent) === number) {
                cell.classList.add('selected');
            }
        });
    });

    socket.on('bingo-confirmed', ({ playerIndex: winnerIndex }) => {
        if (playerIndex === winnerIndex) {
            alert('Congratulations! You won!');
        } else {
            alert('Opponent has Bingo!');
        }
    });

    socket.on('bingo-invalid', () => {
        alert('Invalid Bingo attempt!');
    });

    socket.on('turn-changed', ({ turn }) => {
        currentPlayerTurn = turn;
        updateTurnIndicator(turn);
    });

    function renderBoard(board) {
        bingoBoard.innerHTML = '';
        board.forEach((number, index) => {
            const cell = document.createElement('div');
            cell.classList.add('bingo-cell');
            cell.textContent = number;
            cell.addEventListener('click', () => {
                if (playerIndex !== null && playerIndex === currentPlayerTurn && !cell.classList.contains('selected')) {
                    socket.emit('mark-cell', { roomId: roomIdInput.value, cellIndex: index, playerIndex });
                    cell.classList.add('selected');
                } else if (cell.classList.contains('selected')) {
                    alert("This cell is already marked!");
                } else {
                    alert("It's not your turn!");
                }
            });
            bingoBoard.appendChild(cell);
        });
    }

    function updateTurnIndicator(turn) {
        if (turn === playerIndex) {
            turnIndicator.textContent = "Your Turn";
            turnIndicator.className = 'turn-your';
        } else {
            turnIndicator.textContent = "Opponent's Turn";
            turnIndicator.className = 'turn-opponent';
        }
    }
});
