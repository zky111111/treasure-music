document.addEventListener("DOMContentLoaded", function () {
  const messageBox = document.getElementById('messageBox');

  // 使用 fetch 加载 location.txt 文件
  fetch('locations.txt')
    .then(response => {
      if (!response.ok) {
        throw new Error('无法加载文本文件');
      }
      return response.text();  // 返回纯文本
    })
    .then(data => {
      const locations = data.split('\n');  // 按行分割文本
      locations.forEach(location => {
        const locationParagraph = document.createElement('p');
        locationParagraph.textContent = location;
        messageBox.appendChild(locationParagraph);  // 将位置描述添加到 messageBox 中
      });
    })
    .catch(error => {
      console.error('加载文本文件时出错:', error);
      messageBox.textContent = '无法加载位置描述。';  // 如果加载出错，显示错误消息
    });


  // 其他游戏逻辑
  const loginPage = document.getElementById('loginPage');
  const gamePage = document.getElementById('gamePage');
  const loginForm = document.getElementById('loginForm');
  const startButton = document.getElementById('startButton');
  const clearButton = document.getElementById('clearButton');
  const playerNameSpan = document.getElementById('playerName');
  const usernameInput = document.getElementById('username');

  const backgroundMusic = new Audio('refract.mp3');
  backgroundMusic.loop = true;
  backgroundMusic.volume = 0.5;

  const gameState = {
    playerId: '123456',
    playerName: '',
    gameHistory: []
  };

  function loadGameState() {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      gameState.playerId = parsedState.playerId;
      gameState.playerName = parsedState.playerName;
      gameState.gameHistory = parsedState.gameHistory;
      console.log("已恢复游戏状态:", gameState);
      showGameHistory();
    } else {
      console.log("没有找到保存的游戏状态");
    }
  }

  function showGameHistory() {
    const historyDiv = document.getElementById('gameHistory');
    historyDiv.innerHTML = '';
    if (gameState.gameHistory.length === 0) {
      historyDiv.textContent = "暂无游戏历史";
    } else {
      gameState.gameHistory.forEach((entry, index) => {
        const entryDiv = document.createElement('div');
        entryDiv.textContent = `第 ${index + 1} 步: ${entry}`;
        historyDiv.appendChild(entryDiv);
      });
    }
  }

  function saveGameState() {
    localStorage.setItem('gameState', JSON.stringify(gameState));
    console.log("游戏状态已保存");
  }

  loginForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const username = usernameInput.value.trim();
    if (username) {
      gamePage.style.display = 'block';
      loginPage.style.display = 'none';
      playerNameSpan.textContent = username;
      gameState.playerName = username;
      logToMessageBox(`欢迎，${username}，准备好开始冒险了吗？`);
      saveGameState();
      backgroundMusic.play();
    } else {
      logToMessageBox('请输入有效的用户名！', true);
    }
  });

  function logToMessageBox(message, isError = false) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.className = isError ? 'log-entry error' : 'log-entry';
    messageBox.appendChild(messageElement);
    messageBox.scrollTop = messageBox.scrollHeight;
  }

  startButton.addEventListener('click', function () {
    findTreasureWithAsyncAwait();
  });

  clearButton.addEventListener('click', function () {
    clearConsole();
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
  });

  function clearConsole() {
    messageBox.innerHTML = '';
    gameState.gameHistory = [];
    localStorage.removeItem('gameState');
    showGameHistory();
  }

  async function findTreasureWithAsyncAwait() {
    const pathPoints = [];
    try {
      const clue = await TreasureMap.getInitialClue();
      logToMessageBox(clue);
      gameState.gameHistory.push(clue);
      saveGameState();
      pathPoints.push({ x: 250, y: 0 });
      moveHunter(250, 0, 'libraryImage');
      drawPath(pathPoints);

      const location = await TreasureMap.decodeAncientScript(clue);
      logToMessageBox(location);
      gameState.gameHistory.push(location);
      saveGameState();
      pathPoints.push({ x: 100, y: 0 });
      moveHunter(100, 0, 'templeImage');
      drawPath(pathPoints);

      const box = await TreasureMap.searchTemple(location);
      logToMessageBox(box);
      gameState.gameHistory.push(box);
      saveGameState();
      pathPoints.push({ x: 600, y: 100 });
      moveHunter(600, 100, 'BoxImage');
      drawPath(pathPoints);

      const puzzleSolved = await TreasureMap.solvePuzzle(box);
      logToMessageBox(puzzleSolved);
      gameState.gameHistory.push(puzzleSolved);
      saveGameState();
      pathPoints.push({ x: 350, y: 200 });
      moveHunter(350, 200, 'Box1Image');
      drawPath(pathPoints);

      const key1 = await TreasureMap.findKey("北边的密室");
      logToMessageBox(key1);
      pathPoints.push({ x: 150, y: 150 });
      moveHunter(150, 150, 'northChamberImage');
      drawPath(pathPoints);

      const key2 = await TreasureMap.findKey("南边的森林");
      logToMessageBox(key2);
      pathPoints.push({ x: 50, y: 150 });
      moveHunter(50, 150, 'southForestImage');
      drawPath(pathPoints);

      const key3 = await TreasureMap.findKey("东边的废墟");
      logToMessageBox(key3);
      pathPoints.push({ x: 500, y: 50 });
      moveHunter(500, 50, 'eastRuinsImage');
      drawPath(pathPoints);

      const boxOpened = await TreasureMap.useKeysToOpenBox([key1, key2, key3]);
      logToMessageBox(boxOpened);
      pathPoints.push({ x: 200, y: 150 });
      moveHunter(200, 150, 'treasureBoxImage');
      drawPath(pathPoints);

      const treasure = await TreasureMap.openTreasureBox();
      logToMessageBox(treasure);
      gameState.gameHistory.push(treasure);
      saveGameState();
      pathPoints.push({ x: 200, y: 300 });
      moveHunter(200, 300);
      drawPath(pathPoints);

      logToMessageBox("寻宝之旅圆满结束，恭喜你成为了传奇探险家！");
    } catch (error) {
      logToMessageBox(error, true);
      logToMessageBox("寻宝之旅虽然艰难，但勇气和智慧会引领你走向新的冒险。");
    }
  }

  function moveHunter(x, y, locationId) {
    const treasureHunterImage = document.getElementById('treasureHunter');
    treasureHunterImage.style.left = `${x}px`;
    treasureHunterImage.style.top = `${y}px`;

    document.querySelectorAll('.location-image').forEach(img => img.style.display = 'none');
    if (locationId) {
      const locationImage = document.getElementById(locationId);
      if (locationImage) {
        locationImage.style.display = 'block';
        locationImage.style.left = `${x}px`;
        locationImage.style.top = `${y}px`;
      }
    }
  }

  function drawPath(points) {
    const pathContainer = document.getElementById('path');
    pathContainer.innerHTML = "";
    for (let i = 0; i < points.length - 1; i++) {
      const startX = points[i].x + 10;
      const startY = points[i].y + 10;
      const endX = points[i + 1].x + 10;
      const endY = points[i + 1].y + 10;

      const pathLine = document.createElement('div');
      pathLine.className = 'path-line';

      const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
      pathLine.style.width = `${length}px`;
      pathLine.style.transform = `rotate(${Math.atan2(endY - startY, endX - startX) * 180 / Math.PI}deg)`;
      pathLine.style.left = `${startX}px`;
      pathLine.style.top = `${startY}px`;

      pathContainer.appendChild(pathLine);
    }
  }

  const TreasureMap = {
    async getInitialClue() {
      return new Promise(resolve => setTimeout(() => resolve('你发现了第一条线索：一个古老的符号。'), 1000));
    },
    async decodeAncientScript(clue) {
      return new Promise(resolve => setTimeout(() => resolve('符号解读：它指向一个废弃的寺庙。'), 1000));
    },
    async searchTemple(location) {
      return new Promise(resolve => setTimeout(() => resolve('你在寺庙中发现了一个隐藏的宝箱。'), 1000));
    },
    async solvePuzzle(box) {
      return new Promise(resolve => setTimeout(() => resolve('谜题解决，你打开了宝箱。'), 1000));
    },
    async findKey(location) {
      return new Promise(resolve => setTimeout(() => resolve(`你在${location}找到了钥匙。`), 1000));
    },
    async useKeysToOpenBox(keys) {
      return new Promise(resolve => setTimeout(() => resolve('你使用钥匙打开了宝箱。'), 1000));
    },
    async openTreasureBox() {
      return new Promise(resolve => setTimeout(() => resolve('宝箱打开，里面有黄金和珠宝！'), 1000));
    }
  };

  loadGameState();
});
