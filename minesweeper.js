const bombImage = document.createElement('img');
    bombImage.src = 'img/bomb.png';
    const flagImage = document.createElement('img');
    flagImage.src = 'img/flag.png';
    flagImage.classList.add('flag-image');
    
    const sizeLookup = {
      '9': {totalBombs: 5},
      '16': {totalBombs: 30},
      '30': {totalBombs: 160},
    };
    
    const bombColors = {
        1: 'blue',
        2: 'green',
        3: 'red',
        4: 'purple',
        5: 'orange',
        6: 'black',
        7: 'grey',
        8: 'yellow',
    };
    
    let milliseconds = 0;
    let seconds = 0;
    let minutes = 0;
    let hours = 0;
    
    
    
    //*******Установление текущего уровня сожности **********/
    let currentDifficulty = 9;
    let totalBombs = sizeLookup[currentDifficulty].totalBombs;
    const buttons = document.querySelectorAll('[id^="size-"]');
    let row = currentDifficulty;
    let col = currentDifficulty;
    
    // Устанавливаем обработчик события клика на каждой кнопке
    buttons.forEach(function(button) {
        button.addEventListener("click", function() {
            
            let idValue = parseInt(button.id.replace('size-', '')); // Получаем число из id кнопки
            let currentDifficulty = idValue; // Устанавливаем значение currentDifficulty
            totalBombs = sizeLookup[currentDifficulty].totalBombs;
            row = currentDifficulty; // Обновляем значения row и col
            col = currentDifficulty;
    
            startGame(currentDifficulty, currentDifficulty, totalBombs); 
            console.log(`Current difficulty: ${currentDifficulty}`);
            console.log(`Total bombs: ${totalBombs}`);
        });
    });
    //********************************************** 
    
    // При первом вызове игры автоматически загружается поле уровня Easy
    document.addEventListener('DOMContentLoaded', function () {
        startGame(currentDifficulty, currentDifficulty, totalBombs);  
    });
    
    // Обработчик события DOMContentLoaded, чтобы код выполнялся после загрузки DOM
    document.getElementById('smileBeginPlay').addEventListener('click', function() {
        startGame(currentDifficulty, currentDifficulty, totalBombs); 
    });
    
    
    let gameOver = false;
    let remainCells = row * col; 
    let timerRunning = false;
    
    let playerName = "Anonymous"; // Устанавливаем значение по умолчанию
    let time = 0;
    
    let localStorageBestPlayer = getBestPlayer();
    if (localStorageBestPlayer === null) {
        // Если данных нет, устанавливаем начальное значение для лучшего игрока
        localStorageBestPlayer = { playerName: 'playerName', bestTime: Infinity };
    }
    
    console.log(localStorageBestPlayer);
    
    //console.log('"name:" playerName');
    
    const playerResultContainer = document.querySelector('.player-result');
    const whoIsPlaying = document.getElementById('whoIsPlaying');
    
    document.addEventListener("DOMContentLoaded", () => {
            const playerNameInput = document.getElementById("playerName");
          
            playerNameInput.addEventListener("keydown", function (event) {
              if (event.key === "Enter") {
                const inputText = playerNameInput.value.trim();
                playerName = inputText || "Anonymous"; // Если inputText пустая строка, устанавливаем "Anonymous"
                console.log(`Who is playing: ${playerName}`);
          
                // Меняем содержание поля ввода на сведения об игроке
                playerResultContainer.style.display = 'none';        
                whoIsPlaying.innerHTML = `${playerName} is playing...`; 
                whoIsPlaying.style.display = 'block'; 
    
              } 
              
            });
            
          });
     //**************************************************     
          class Player {
            constructor(playerName, time) {
              this.playerName = playerName;
              this.bestTime = time;
            }
          
            // Метод для обновления лучшего времени игрока
            updateBestTime(newTime) {
                if (newTime < this.bestTime) {
                    this.bestTime = newTime;
                    
                }
              }
    }    
    //*********************************************************** 
    
    // Начало игры
    
    function startGame(rows, cols, totalBombs) {
        
        
    playerResultContainer.style.display = 'block';
    whoIsPlaying.style.display = 'none';
    
        board = createGameBoard(rows, cols);
        addBombs(board, totalBombs);
        document.getElementById('lose-message').style.display = 'none';
        document.getElementById('win-message').style.display = 'none';
        document.getElementById(`record-message`).style.display =`none`;
        remainCells = row * col;
        gameOver = false;
    
        
    // Получаем все изображения в группе
    const faceImages = document.querySelectorAll('.face-img');
    
    // Устанавливаем атрибут src для каждого изображения на "./img/smile-face.png"
    faceImages.forEach(function(img) {
        img.src = "./img/smile-face.png";
    });
        
    // Перезапуск таймера
    isFirstClick = true;
    resetTimer();
    
    // Очищаем интервал таймера, если он был запущен
     if (timerRunning) {
        clearInterval(timerInterval);
        timerRunning = false;
    }
    
    calculateAdjBombs(board);
    //console.log(`Who is playing ${playerName}`);
    }
    
    
    
    
    // Создание игрового поля
    let board = null; // Создаем пустой двухмерный массив для игрового поля
    
    function createGameBoard(rows, cols) {
        const boardContainer = document.getElementById('board');
        boardContainer.innerHTML = ''; // Очистить контейнер, если уже есть игровое поле
    
        board = [];
        // Создание игрового поля без бомб
        for (let i = 0; i < rows; i++) {
            const row = document.createElement('tr');
            const rowArray = []; // Создаем пустой массив для строки игрового поля
            for (let j = 0; j < cols; j++) {
                const cell = document.createElement('td');
                cell.className = 'game-cell'; // Добавить класс для стилизации
                row.appendChild(cell);
    
                const cellImage = document.createElement('img'); // Создаем элемент изображения для ячейки
                cellImage.src = ''; // По умолчанию не показываем изображение
                cell.appendChild(cellImage); // Добавляем изображение в ячейку
    
                // Установка флага revealed на false для каждой ячейки
                rowArray.push({ hasBomb: false, cellImage, revealed: false }); // Добавляем объект в массив строки с информацией о наличии бомбы, изображении и флаге revealed
                
                // Добавляем обработчик события contextmenu для правой кнопки мыши
                cell.addEventListener('contextmenu', function(event) {
                    event.preventDefault(); // Предотвращаем стандартное контекстное меню браузера
                    handleCellRightClick(event, i, j);
                });
            
            }
            board.push(rowArray); // Добавляем массив строки в массив игрового поля
            boardContainer.appendChild(row);
        }
    
        return board; // Вернуть игровое поле для размещения бомб
    }
    
    
    // Размещение бомб на поле
    
    function getRandomCoordinate(size) {
        return Math.floor(Math.random() * size);
    }
    
    function addBombs(board, totalBombs) {
        const size = board.length;
        const availableCells = [];
    
        // Заполняем массив доступных ячеек
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                availableCells.push({ row, col });
            }
        }
    
        // Размещаем бомбы случайным образом из доступных ячеек
        for (let i = 0; i < totalBombs; i++) {
            const randomIndex = Math.floor(Math.random() * availableCells.length);
            const { row, col } = availableCells.splice(randomIndex, 1)[0];
            board[row][col].hasBomb = true;
        }
    
        return board;
    }
    
    // Обработчик клика на ячейку
    let isFirstClick = true; // Флаг, который показывает, был ли сделан первый клик
    document.getElementById('board').addEventListener('click', function(event) {
        
        if (gameOver) {
            return;
        }
    
        playerResultContainer.style.display = 'none';        
        whoIsPlaying.innerHTML = `${playerName} is playing...`; 
        whoIsPlaying.style.display = 'block'; 
    
        const clickedCell = event.target;
    
        if (clickedCell.tagName === 'TD' && clickedCell.classList.contains('game-cell')) {
            const rowIndex = clickedCell.parentElement.rowIndex;
            const cellIndex = clickedCell.cellIndex;
    
            const cell = board[rowIndex][cellIndex];
            //console.log(remainCells);
            if (cell.hasBomb) {
                openAllBombs();
                      
                // Показываем сообщение о проигрыше
                const messageLoseDiv = document.getElementById('lose-message');
                const messageLose = `${playerName}, sorry, you lost the game!`;
                messageLoseDiv.textContent = messageLose;
                messageLoseDiv.style.display = 'block'; // Сделать сообщение видимым
                whoIsPlaying.style.display = 'none';
                
                // Устанавливаем состояние игры "проиграно"
                gameOver = true;
                updateSmile();
                
            } else {
                // Если ячейка не имеет бомбы, открываем её
                openCell(rowIndex, cellIndex);
               
            }
        // Проверяем условие победы после каждого клика
        if (remainCells === totalBombs) {
            openAllBombs();
            const messageWinDiv = document.getElementById('win-message');
            const messageWin = `${playerName}, congratulations! You win! You found all the bombs in ${hours}:${minutes}:${seconds}:${milliseconds}`;
            messageWinDiv.textContent = messageWin;
            messageWinDiv.style.display = 'block'; // Сделать сообщение о победе видимым
            whoIsPlaying.style.display = 'none';
        
            gameOver = true;
            updateSmile();
            time = milliseconds + seconds * 1000 + minutes * 60 * 1000 + hours * 60 * 60 * 1000;
            console.log(`Time in msec: ${time}`);
        
            console.log(`Time of the game: ${hours}:${minutes}:${seconds}:${milliseconds}`);
            addPlayer(playerName, time);
            //findBestPlayer(players);
            bestPlayer = findBestPlayer(players);
            console.log(`Player ${bestPlayer.playerName} has time: ${bestPlayer.bestTime} msec`);
            //console.log(players);
            //console.log(bestPlayer);
        
            // Проверяем, улучшил ли игрок результат
            if (time <= bestPlayer.bestTime) {
                saveBestPlayer({ playerName, bestTime: time });
                showRecordMessage(bestPlayer, playerName, localStorageBestPlayer);
            }
        
            //console.log(`После победы`);
            console.log(players);
            console.log(bestPlayer);
            //console.log(`Играл: ${playerName}`);
        }
    }
        // Если это первый клик, запускаем таймер
        if (isFirstClick) {
            isFirstClick = false;
            timerRunning = true; // Устанавливаем флаг, что таймер запущен
            timerInterval = setInterval(updateTime, 1); // Запуск таймера каждую секунду (1000 миллисекунд)
        }
    });
    
    
    
    
    // Обработчик для клика на правую кнопку мыши
    function handleCellRightClick(event, i, j) {
        event.preventDefault(); // Предотвращаем стандартное контекстное меню браузера
    
        if (gameOver) {
            return; // Если игра завершена, игнорируем клик правой кнопкой
        }
    
        playerResultContainer.style.display = 'none';        
        whoIsPlaying.innerHTML = `${playerName} is playing...`; 
        whoIsPlaying.style.display = 'block'; 
    
        const cell = board[i][j]; // Получаем соответствующую ячейку
        //const clickedCell = event.target;
    
        if (cell.revealed) {
            return; // Если ячейка уже открыта, игнорируем клик правой кнопкой
        }
    
        const cellImage = cell.cellImage; 
    
        if (!cell.flagged) {
            // Если ячейка не была отмечена флагом, устанавливаем флаг
            cell.flagged = true;
            cellImage.src = flagImage.src; // Установите изображение флага
        } else {
            // Если ячейка уже была отмечена флагом, удаляем флаг
            cell.flagged = false;
            cellImage.src = ''; // Очистите изображение (удалите флаг)
        }
        
        if (isFirstClick) {
            isFirstClick = false;
            timerRunning = true; // Устанавливаем флаг, что таймер запущен
            timerInterval = setInterval(updateTime, 1); // Запуск таймера каждую секунду (1000 миллисекунд)
        }
        
        if (remainCells === totalBombs) {
            openAllBombs();
            const messageWinDiv = document.getElementById('win-message');
            const messageWin = `${playerName}, congratulations! You win! You found all the bombs in ${hours}:${minutes}:${seconds}:${milliseconds}`;
            messageWinDiv.textContent = messageWin;
            messageWinDiv.style.display = 'block'; // Сделать сообщение о победе видимым
            whoIsPlaying.style.display = 'none';
        
            gameOver = true;
            updateSmile();
            time = milliseconds + seconds * 1000 + minutes * 60 * 1000 + hours * 60 * 60 * 1000;
            console.log(`Time in msec: ${time}`);
        
            console.log(`Time of the game: ${hours}:${minutes}:${seconds}:${milliseconds}`);
            addPlayer(playerName, time);
            //findBestPlayer(players);
            bestPlayer = findBestPlayer(players);
            console.log(`Player ${bestPlayer.playerName} has the best time: ${bestPlayer.bestTime} msec`);
            //console.log(players);
           // console.log(bestPlayer);
        
            // Проверяем, улучшил ли игрок результат
            if (time <= bestPlayer.bestTime) {
                saveBestPlayer({ playerName, bestTime: time });
                showRecordMessage(bestPlayer, playerName, localStorageBestPlayer);
            }
        
            //console.log(`После победы`);
            //console.log(players);
            //console.log(bestPlayer);
            //console.log(`Играл: ${playerName}`);
        }
    }
    
    // Функция для вычисления и установки adjBombs для каждой ячейки
    function calculateAdjBombs(board) {
        const numRows = board.length;
        const numCols = board[0].length;
    
        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                if (!board[row][col].hasBomb) {
                    let bombCount = 0;
    
                    // Проверяем восемь соседних ячеек
                    const neighbors = [
                        [-1, -1], [-1, 0], [-1, 1],
                        [0, -1],           [0, 1],
                        [1, -1], [1, 0], [1, 1]
                    ];
    
                    for (const [dr, dc] of neighbors) {
                        const newRow = row + dr;
                        const newCol = col + dc;
    
                        if (newRow >= 0 && newRow < numRows && newCol >= 0 && newCol < numCols) {
                            if (board[newRow][newCol].hasBomb) {
                                bombCount++;
                            }
                        }
                    }
    
                    // Устанавливаем adjBombs для ячейки
                    board[row][col].adjBombs = bombCount;
                }
            }
        }
    }
    
    // Открываем пустые ячейки
    function openCell(row, col) {
        const cell = board[row][col];
        
        if (cell.revealed) {
            return;
        }
    
        cell.revealed = true;
        const clickedCell = document.querySelector(`#board tr:nth-child(${row + 1}) td:nth-child(${col + 1})`);
        //console.log('Opening cell:', row, col);
    
        // Добавляем класс для подсветки открытой ячейки
        clickedCell.classList.add('revealed');
    
        if (cell.adjBombs === 0) {
            const neighbors = [
                [-1, -1], [-1, 0], [-1, 1],
                [0, -1],           [0, 1],
                [1, -1], [1, 0], [1, 1]
            ];
    //console.log(neighbors);
            for (const [dr, dc] of neighbors) {
                const newRow = row + dr;
                const newCol = col + dc;
                //console.log(`Checking neighbor at row: ${newRow}, col: ${newCol}`);
    
                if (newRow >= 0 && newRow < board.length && newCol >= 0 && newCol < board[0].length) {
                    const newCell = board[newRow][newCol];
                    //const newClickedCell = document.querySelector(`#board tr:nth-child(${newRow + 1}) td:nth-child(${newCol + 1})`);
    
                    if (!newCell.revealed) {
                        openCell(newRow, newCol); // Рекурсивный вызов для соседних ячеек
                        
                    }
                }
            }
        } else {
            clickedCell.textContent = cell.adjBombs;
            
            const color = bombColors[cell.adjBombs]; // Берем цвет из объекта
            
            if (color) {
                clickedCell.style.color = color; // Подсвечиваем
        }
        }
    
        remainCells--;
        
        //Снятие флага с ячеек, оказавшихся на пустом поле
        if (cell.flagged) {
            cell.flagged = false;
            cell.cellImage.src = ''; // Очищаем изображение (удаляем флаг)
        }
    
    }
    
    function openAllBombs() {
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                if (board[i][j].hasBomb) {
                    board[i][j].cellImage.src = 'img/bomb.png';
                    board[i][j].cellImage.classList.add('bomb-image');
                }
            }
        }
    }
    
    function updateSmile() {
        const smileFaceImg = document.getElementById("smileBeginPlay");
    
        if (gameOver && remainCells === totalBombs) {
            smileFaceImg.src = "./img/cool-face.png"; // Изображение смайлика при победе
    
        } else {
            smileFaceImg.src = "./img/sad-face.png"; // Изображение смайлика при поражении
        }
    }   
        
    // Установка таймера
    
    function updateTime() {
        if (!gameOver) {
            milliseconds++; 
    
            if (milliseconds == 1000) {
                milliseconds = 0;
                seconds++;
            }
    
            if (seconds == 60) {
                seconds = 0;
                minutes++;
            }
            if (minutes == 60) {
                minutes = 0;
                hours++;
            }
            if (hours == 24) {
                seconds = 0;
                minutes = 0;
                hours = 0;
            }
            
            const timerElement = document.getElementById("timer");
            timerElement.textContent =
            (hours < 10 ? "0" : "") +
            hours + 
            ":" +
            (minutes < 10 ? "0" : "") +
            minutes +
            ":" +
            (seconds < 10 ? "0" : "") +
            seconds +
            ":" +
            (milliseconds < 10 ? "00" : (milliseconds < 100 ? "0" : "")) +
            milliseconds;
        }
    
        if (gameOver) {
            clearInterval(timerInterval); // Останавливаем таймер
            // Расчет времени после завершения игры
    //const time = `${hours}:${minutes}:${seconds}:${milliseconds}`;
    //console.log(`Игрок ${playerName} закончил игру за ${time}`);
        
    }
    
    }
    
    // Сброс таймера и обнуление
    function resetTimer() {
        milliseconds = 0;
        seconds = 0;
        minutes = 0;
        hours = 0;
        const timerElement = document.getElementById("timer");
        timerElement.textContent = "00:00:00:00";
    }
    
    // ***************** Результаты ************
    
    const players = [];
    //console.log(players);
    
    function addPlayer(playerName, time) {
        if (gameOver === true && remainCells === totalBombs) {
            let existingPlayer = players.find(player => player.playerName === playerName);
    
            if (!existingPlayer) {
                // Если игрока нет, создаем нового игрока и добавляем его
                const player = new Player(playerName, time);
                players.push(player);
            } else {
                // Если игрок уже есть, обновляем его лучшее время, если новое время лучше
                existingPlayer.updateBestTime(time);
            }
        }
    
    }
    
    
    function findBestPlayer(players) {
        if (players.length === 0) {
            console.log("Нет игроков.");
            return;
        }
    
        localBestPlayer = players[0];
    
        for (const player of players) {
            if (player.bestTime < localBestPlayer.bestTime) {
                localBestPlayer = player;
                
            }
        }
    
    
        //console.log(`Лучший игрок - объект`);
        //console.log(localBestPlayer);
        //console.log(`Лучший игрок - время`);
        //console.log(localBestPlayer.bestTime);
        //console.log(`Уровень сложности`);
        //console.log(currentDifficulty);
    
        return localBestPlayer;
    
    }
    
    function showRecordMessage(bestPlayer, playerName, localStorageBestPlayer) {
                
        if (bestPlayer !== null &&  time <= localStorageBestPlayer.bestTime) {
            const messageRecordDiv = document.getElementById('record-message');
            const messageRecord = `${playerName}, congratulations, you've got a new record - ${bestPlayer.bestTime}`;
            messageRecordDiv.textContent = messageRecord;
            messageRecordDiv.style.display = 'block';
            console.log(`${playerName} has got a record - ${bestPlayer.bestTime}`);
    
            
        }
    }
    
    
    // ********* ЛОкальное хранилище ********
    // Функция, которая сохраняет данные о лучшем игроке в локальное хранилище
    function saveBestPlayer(player) {
        const localStorageBestPlayer = getBestPlayer(); // Получаем текущие данные из локального хранилища
    
        if (localStorageBestPlayer === null || player.bestTime < localStorageBestPlayer.bestTime) {
            localStorage.setItem('bestPlayer', JSON.stringify(player));
            //console.log('Сохраненный лучший игрок:', player);
        }
    }
    
    function getBestPlayer() {
        const bestPlayerJSON = localStorage.getItem('bestPlayer');
        return JSON.parse(bestPlayerJSON) || { playerName: 'Имя игрока', bestTime: Infinity };
    }
  