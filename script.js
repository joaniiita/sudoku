
let numSelected = null;
let tileSelected = null;


let score = 0;
let errors = 0;
let emptySpaces;

let timerInterval = null;
let totalSeconds = 0;

// We create an empty board of 9x9
let solution = Array.from({length:9}, () => Array(9).fill(0));
let board;

window.onload = function () {
    initializeGame();
    document.getElementById('difficulty').addEventListener('change', initializeGame);
}

function initializeGame(){
    stopTimer();

    document.getElementById('board').innerHTML = '';
    document.getElementById('digits').innerHTML = '';

    emptySpaces = setDifficulty();
    fillBoard(solution);
    board = generateSudokuBoard(solution, emptySpaces);
    setGame();
    startTimer();

}

// Algorithm of Fisher Yates:
// The result of this process is an array with the same elements but in different order randomly

function getShuffledBoard() {
    const allowedNums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = allowedNums.length - 1; i > 0; i--) {
        const randomNum = Math.floor(Math.random() * (i + 1));
        [allowedNums[i], allowedNums[randomNum]] = [allowedNums[randomNum], allowedNums[i]];
    }
    return allowedNums;
}


function isInRow(board, r, num) {
    return board[r].includes(num);
}

function isInColumn(board, c, num) {
    for (let i = 0; i < 9; i++) {
        if (board[i][c] === num) return true;
    }
    return false;
}

function isInSquare(board, r, c, num) {
    const boxRow = Math.floor(r / 3) * 3;
    const boxCol = Math.floor(c / 3) * 3;

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[boxRow + i][boxCol + j] === num) {
                return true;
            }
        }
    }
    return false;
}


function isValidMove(board, r, c, num) {
    return !isInRow(board, r, num) && !isInColumn(board, c, num) && !isInSquare(board, r, c, num);
}

// If the board is fill, we return true if not, we fill with random numbers and we verify if it is a valid move
function fillBoard(solutionBoard) {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (solutionBoard[r][c] === 0){
                const numbers = getShuffledBoard();
                
                for (let num of numbers) {
                    if (isValidMove(solutionBoard, r, c, num)){
                        solutionBoard[r][c] = num;

                        if (fillBoard(solutionBoard)){
                            return true;
                        }

                        solutionBoard[r][c] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

// Generate the board with gaps to play it
function generateSudokuBoard(fullBoard, emptySpaces){
    let sudokuBoard = fullBoard.map(row => row.slice());

    let removed = 0;

    while (removed < emptySpaces) {
        let r = Math.floor(Math.random() * 9);
        let c = Math.floor(Math.random() * 9);

        if (sudokuBoard[r][c] !== '-'){
            sudokuBoard[r][c] = '-';
            removed++;
        }
    }
    return sudokuBoard;
}

// Recoger el value del select y establecer los emptySpaces
function setDifficulty(){
    totalSeconds = 0;
    let diff = document.getElementById('difficulty');
    let select_diff = diff.options[diff.selectedIndex].value;

    if (select_diff === 'easy'){
        emptySpaces = 40;
    } else if (select_diff === 'medium'){
        emptySpaces = 55;
    } else if (select_diff === 'hard'){
        emptySpaces  = 70;
    }

    return emptySpaces;
}


function setGame(){
    // Digits 1-9
    for (let i = 1; i <= 9; i++) {
        let number = document.createElement('div');
        number.id = i;
        number.innerHTML = i;
        number.addEventListener('click', selectNumber);

        number.classList.add('number');
        document.getElementById('digits').appendChild(number);
    }

    // Board 9x9
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            let tile = document.createElement('div');
            let solveButton = document.getElementById('solve');
            let resetButton = document.getElementById('reset');
            let eraseButton = document.getElementById('eraser');
            tile.id = r.toString() + '-' + c.toString();
            if (board[r][c] !== '-'){
                tile.innerHTML = board[r][c];
                tile.classList.add('tile-start');
            }

            if(r === 2 || r === 5){
                tile.classList.add('horizontal-line');
            }

            if (c === 2 || c === 5){
                tile.classList.add('vertical-line');
            }

            tile.addEventListener('click', selectTile);
            tile.classList.add('tile');
            solveButton.addEventListener('click', solveGame);
            resetButton.addEventListener('click', resetGame);
            eraseButton.addEventListener('click', eraseTile);
            document.getElementById('board').appendChild(tile);
        }
    }
}

function selectNumber(){

    if (numSelected === this){
        numSelected.classList.remove('number-selected');
        numSelected = null;
        return;
    }

    if (numSelected != null){
        numSelected.classList.remove('number-selected');
    }

    numSelected = this;
    numSelected.classList.add('number-selected');

}

function selectTile(){

    if (tileSelected){
        tileSelected.classList.remove('tile-selected')
    }

    let coords = this.id.split('-');

    let r = parseInt(coords[0]);
    let c = parseInt(coords[1]);

    tileSelected = document.getElementById(r.toString() + '-' + c.toString());
    tileSelected.classList.add('tile-selected');


    if (numSelected){
        let tile = document.getElementById(r.toString() + '-' + c.toString());
        if (this.innerHTML !== '' && (!tile.classList.contains('error-number'))){
            return;
        }

        if (solution[r][c] === parseInt(numSelected.id)){
            tile.classList.remove('error-number');
            this.innerHTML = numSelected.id;
            score += 30;
            document.getElementById('score').innerHTML = score;
        } else {
            errors++;
            tile.classList.add('error-number');
            this.innerHTML = numSelected.id;
            document.getElementById('errors').innerHTML = errors;

            if (errors === 3){
                gameOver();
            }
        }
    }
}


function solveGame(){
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            let tile = document.getElementById(r.toString() + '-' + c.toString());
            tile.innerHTML = solution[r][c];
            tile.classList.remove('error-number');
        }
    }

}

function resetGame() {
    errors = 0;
    score = 0;
    totalSeconds = 0;

    document.getElementById('score').innerHTML = score;
    document.getElementById('errors').innerHTML = errors;
    document.getElementById('result').innerHTML = '';


    initializeGame();



}

function eraseTile() {
    if (!tileSelected) return;

    let coords = tileSelected.id.split('-');
    let r = parseInt(coords[0]);
    let c = parseInt(coords[1]);

    if (tileSelected.classList.contains('tile-start')) return;

    if (tileSelected.innerHTML !== '' && parseInt(tileSelected.innerHTML) !== solution[r][c]) {
        tileSelected.innerHTML = '';
        tileSelected.classList.remove('error-number');
    }
}

function gameOver(){
    document.getElementById('result').innerHTML = 'Game Over!'
    solveGame();
}

function calculateTimer(value){
    let valueString = value + '';

    if (valueString.length < 2){
        return '0' + valueString;
    } else {
        return valueString;
    }
}

function setTimer(){

    let minutes = document.getElementById('minutes');
    let seconds = document.getElementById('seconds');
    ++totalSeconds;
    seconds.innerHTML = calculateTimer(totalSeconds % 60);
    minutes.innerHTML = calculateTimer(parseInt(totalSeconds / 60));


}

function startTimer(){
    if (timerInterval !== null){
        clearInterval(timerInterval);
    }

    totalSeconds = 0;
    timerInterval = setInterval(setTimer, 1000);
}

function stopTimer(){
    if (timerInterval !== null){
        clearInterval(timerInterval);
        timerInterval = null;
    }
}
