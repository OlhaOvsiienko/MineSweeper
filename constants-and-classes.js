// Изображения (бомбы, флаги)
const bombImage = document.createElement('img');
bombImage.src = 'img/bomb.png';
const flagImage = document.createElement('img');
flagImage.src = 'img/flag.png';
flagImage.classList.add('flag-image');

// Игровое поле: размер, количество бомб, фвета цифр в ячейках возле бомб
const sizeLookup = {
  '9': {totalBombs: 5},
  '16': {totalBombs: 5},
  '30': {totalBombs: 160}
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

// Таймер
let milliseconds = 0;
let seconds = 0;
let minutes = 0;
let hours = 0;

// Определение текущего уровеня сложности
let currentDifficulty = 9;
let totalBombs = sizeLookup[currentDifficulty].totalBombs;
const buttons = document.querySelectorAll('[id^="size-"]');
let row = currentDifficulty;
let col = currentDifficulty;

// Игровые переменные
let gameOver = false;
let remainCells = row * col; 
let timerRunning = false;
let timerInterval;

// Данные игрока
let playerName = "Anonymous"; // Устанавливаем значение по умолчанию
let time = 0;
let bestPlayer = null;
let players = [];    

let localStorageBestPlayer = {};

// Всплывающие сообщения
const playerResultContainer = document.querySelector('.player-result');
const whoIsPlaying = document.getElementById('whoIsPlaying');

//********************************** Classes **************************

// Класс Ячейки

class BoardCell {
    hasBomb = false;
    revealed = false;
    cellImage;
    rowIndex;
    colIndex;
    htmlCell;
  
    constructor(rowIndex, colIndex) {
      this.rowIndex = rowIndex;
      this.colIndex = colIndex;
      this.htmlCell = document.createElement("td");
      this.htmlCell.className = "game-cell"; // Добавляем класс для стилизации
  
      this.cellImage = document.createElement("img"); // Создаем элемент изображения для ячейки
      this.cellImage.src = ""; // По умолчанию не показываем изображение
      this.htmlCell.appendChild(this.cellImage); // Добавляем изображение в ячейку
  
      this.htmlCell.addEventListener("contextmenu", (event) =>
        // Предотвращаем стандартное контекстное меню браузера
        this.handleCellRightClick(event)
      );
  
      this.htmlCell.addEventListener("click", (event) => this.handleClick());
    }
  
    handleCellRightClick(event) {
      event.preventDefault(); // Предотвращаем стандартное контекстное меню браузера
  
      if (gameOver || this.revealed) {
        return; // Если игра завершена или ячейка уже открыта, игнорируем клик правой кнопкой
      }
  
      playerResultContainer.style.display = 'none';        
      whoIsPlaying.innerHTML = `${playerName} is playing...`; 
      whoIsPlaying.style.display = 'block'; 

      if (!this.flagged) {
        // Если ячейка не была отмечена флагом, устанавливаем флаг
        this.flagged = true;
        this.cellImage.src = flagImage.src; // Установите изображение флага
      } else {
        // Если ячейка уже была отмечена флагом, удаляем флаг
        this.flagged = false;
        this.cellImage.src = ""; // Очистите изображение (удалите флаг)
      }
  
      if (isFirstClick) {
        isFirstClick = false;
        timerRunning = true; // Устанавливаем флаг, что таймер запущен
        timerInterval = setInterval(updateTime, 1); // Запуск таймера каждую мск
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
        Player.addPlayer(players, playerName, time);
        bestPlayer = Player.findBestPlayer(players);
        console.log(`Player ${bestPlayer.playerName} has the best time: ${bestPlayer.bestTime} msec`);
    
        // Проверяем, улучшил ли игрок результат
        if (time <= bestPlayer.bestTime) {
            saveBestPlayer({ playerName, bestTime: time });
            localStorageBestPlayer = getBestPlayer();
            showRecordMessage(bestPlayer, playerName, localStorageBestPlayer);
        }
      }
    }
  
    handleClick() {
      if (gameOver) {
        return;
      }

      playerResultContainer.style.display = 'none';
      whoIsPlaying.innerHTML = `${playerName} is playing...`; 
      whoIsPlaying.style.display = 'block'; 
  
      if (this.hasBomb) {
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
        openCell(this.rowIndex, this.colIndex);
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
        
        Player.addPlayer(players, playerName, time);
        bestPlayer = Player.findBestPlayer(players);
        console.log(`Player ${bestPlayer.playerName} has time: ${bestPlayer.bestTime} msec`);
      
        if (time <= bestPlayer.bestTime) {
            saveBestPlayer({ playerName, bestTime: time });
            console.log(`Рекорд: ${bestPlayer.playerName}, лучшее время: ${bestPlayer.bestTime}`);
            localStorageBestPlayer = getBestPlayer();
            console.log(`Локальное хранилище - передан:`);
            console.log(localStorageBestPlayer);
            showRecordMessage(bestPlayer, playerName, localStorageBestPlayer);
        }
    }

      // Если это первый клик, запускаем таймер
      if (isFirstClick) {
        isFirstClick = false;
        timerRunning = true; // Устанавливаем флаг, что таймер запущен
        timerInterval = setInterval(updateTime, 1); // Запуск таймера каждую секунду (1000 миллисекунд)
    }
}
}

// Класс Игрок

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
  
    static addPlayer(players, playerName, time) {
        
        if (!Array.isArray(players)) {
            console.error("players is not an array.");
            return;
        }

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
            console.log(players);
        }
    }

    static findBestPlayer(players) {
        if (players.length === 0) {
            console.log("Нет игроков.");
            return;
        }

        let localBestPlayer = players[0];

        for (const player of players) {
            if (player.bestTime < localBestPlayer.bestTime) {
                localBestPlayer = player;
            }
        }
    
        return localBestPlayer;
    }
}
