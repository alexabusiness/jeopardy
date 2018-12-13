const domMethods = {
  render,
  showAnswers,
  updateBoard,
  createPlayerArea,
  createQuitButton,
  resetGame,
  clearScreen,
  transitionToGame
}

function render(event) {
  let targetOfClue = event.target.dataset.id;
  let targetOfAnswer = event.target.closest('.question');
  const isRoundOneOrTwo = targetOfClue && game.round < 3;
  
  if (isRoundOneOrTwo && game.canClickClue) {
    $("#game-board").hide();
    showAnswerOrWager(targetOfClue);
  }
  
  if (targetOfAnswer) {
    game.update(event.target.id, event.target.innerText);
    clearScreen();
    createPlayerArea();
  }
  
  if (targetOfAnswer && game.round < 3) {
    updateBoard();
  } else if (game.round === 3) {
    showFinalRound();
  }
}

function showFinalRound() {
  let posValues = [5, 10, 100, 1000];
  let negValues = [-5, -10, -100, -1000];

  let view = document.querySelector(`#view`);

  $(".question").hide();
  view.append(createWagerArea(posValues, negValues));
  
  $("#wager-amount").on("click", () => {
    if (!game.players[1].finalWager) {
      game.rotateCurrentPlayer();
    } else {
      game.rotateCurrentPlayer();
      showAnswers(buildClueBox(32), 32);
    } 
  });

  [...document.querySelectorAll('.number')].forEach((wagerNum) => {
    wagerNum.addEventListener('click', (e) => {

      const selectedAmt = parseInt(e.target.innerText);
      const submitAmount = parseInt($("#wager-amount").text());

      $("#wager-amount").text(submitAmount + selectedAmt);
      game.players[0].finalWager = submitAmount + selectedAmt;
    })
  })
}

function showAnswerOrWager(clueId) {
  let clueBox = buildClueBox(clueId);

  game.canClickClue = false;
  if (game.dataManager.data[clueId] instanceof Wager) {
    showWager(clueId);
  } else {
    showAnswers(clueBox, clueId);
  }
}

function showWager(clueId) {
  let posValues = [5, 10, 100, 1000];
  let negValues = [-5, -10, -100, -1000];

  let view = document.querySelector(`#view`);
  
  $(".question").hide();
  view.append(createWagerArea(posValues, negValues));

  $("#wager-amount").on("click", () => {
    showAnswers(buildClueBox(clueId), clueId);
  });

  [...document.querySelectorAll('.number')].forEach((wagerNum) => {
    wagerNum.addEventListener('click', (e) => {

      const selectedAmt = parseInt(e.target.innerText);
      const submitAmount = parseInt($("#wager-amount").text());

      $("#wager-amount").text(submitAmount + selectedAmt);
      game.dataManager.data[clueId].value = submitAmount + selectedAmt;
    })
  })
}

function buildClueBox(clueId) {
  let clueBox;
  let clue = game.dataManager.data[clueId];
  clueBox = createElWithClass('div', `.question`);
  clueBox.append(createElWithClass('h3', '.question', clue.category));
  clueBox.append(createElWithClass('h3', '.question', clue.value));
  clueBox.append(createElWithClass('h3', '.question', clue.question));

  $("#view").append(clueBox);
  return clueBox;
}

function createWagerArea(positives, negatives) {
  let wagerContainer;
  let tempElement;

  wagerContainer = createElWithClass('div', '.wager');
  wagerContainer.append(createElWithClass('h1', '.wager', 'Wager'));

  tempElement = createElWithClass('section', '.ans-pos-box');
  wagerContainer.append(buildWagerValueBox(tempElement, positives));

  tempElement = createElWithClass('section', '.ans-neg-box');
  wagerContainer.append(buildWagerValueBox(tempElement, negatives));

  tempElement = createElWithClass('section', '.range-submit');
  tempElement.append(createElWithClass('span', '.wager-range', 'min: 5'));
  wagerContainer.append(tempElement);

  tempElement.append(createElWithId('button', '#wager-amount', '0'));
  wagerContainer.append(tempElement);

  tempElement.append(createElWithClass('span', '.wager-range', 'max: 9999'));
  wagerContainer.append(tempElement);

  return wagerContainer;
}

function buildWagerValueBox(element, arr) {
  arr.forEach((value) => {
    element.append(createElWithClass('span', '.number', value));
  });
  return element;
}

function showAnswers(clueBox, clueId) {
  $(".wager").remove();
  
  let answerContainer;
  let correctAnswer = game.dataManager.data[clueId].answer;
  let answers = game.getAllCluesByCategoryId(game.dataManager.data[clueId].categoryId, clueId);
  answers.push(correctAnswer);
  answers = game.dataManager.randomizeArray(answers);
  answers = answers.map(answer => answer);

  answerContainer = createElWithClass('div', '.answerContainer');
  answers.forEach(answer => {
    let answerBox = createElWithId('div', `#${clueId}`, answer)
    answerBox.classList.add('answer');
    answerContainer.append(answerBox);
  });

  clueBox.append(answerContainer);
  clueBox.append(createElWithClass('button', '.contBtn', 'Continue'));

  [...document.querySelectorAll('.answer')].forEach((elem) => {
    elem.addEventListener('click', (event) => {
  
      if (game.round < 3) {
        $(".question").remove();
        $("#game-board").show();
        render(event)
      } else {
        let playerGuess = event.target.innerText
        let isCorrectGuess = game.checkAnswer(clueId, playerGuess);
        game.updateFinalWager(isCorrectGuess);
        if (game.finalContestants < 2) {
          game.rotateCurrentPlayer();
          game.finalContestants++;
        } else {
          $(".question").remove();
          let resultList = game.determineWinner();

          let resultsContainer = createElWithId('div', '#results')
          resultList.forEach(player => { 
            let tempEl = createElWithClass('span', '.results', `${player.name} $${player.finalWager}`);
            resultsContainer.append(tempEl);
          })
          
          $("#view").append(resultsContainer);
        }
      }
    })
  })
}

function updateBoard() {
  $("#view").append(createBoard());
  $("#game-board").on("click", render);
}

function createBoard() {
  let tempGameBoard = createElWithId('main', '#game-board');

  let id = 0;
  let colCount = 4;
  let rowCount = 4;
  if (game.round === 2) {
    id = 16;
  } else if (game.round === 3) {
    colCount = 1;
    rowCount = 1;
    id = 32;
  }

  for (let i = 0; i < colCount; i++) {
    let column = createElWithClass('section', '.category');
    let clueCat = `<h1>${game.dataManager.data[id].category}</h1>`;
    let row = createElWithClass('article', '.clue', '', clueCat);

    column.append(row);
    for (let j = 0; j < rowCount; j++) {
      let clueValue = '';
      if (game.dataManager.data[id].available) {
        clueValue = `<h1> ${game.dataManager.data[id].value}</h1>`;
        row = createElWithClass('article', '.clue', '', clueValue);
        row.dataset.id = `${id}`;
      } else {
        row = createElWithClass('article', '.clue', '', clueValue);
      }
      id++;
      column.append(row);
    }
    tempGameBoard.append(column);
  }
  return tempGameBoard;
}

function createPlayerArea() {
  let playerArea = createElWithId('section', '#player-area');

  $("#view").append(playerArea);
  updatePlayers(playerArea);
}

function updatePlayers(playerArea) {
  game.players.forEach((player, i) => {
    let { name, score } = player;
    let playerCard = `${name} score: ${score}`;
    let user = createElWithClass('article', `.player-${i}`, playerCard);
    playerArea.append(user);
  });
}

function createQuitButton() {
  $("#view").append(createElWithId('article', '#quit', 'QUIT'));
  $("#quit").on("click", resetGame);
}

function resetGame() {
  location.reload();
}

function clearScreen() {
  $("#view").html("");
}

function transitionToGame() {
  const playerNames = $('.player-name-input').toArray().map(player => {
    return player.value;
  });
  // transition img below
  $("#view").html(`<img src="./img/loading.gif">`);

  // timeout is to display the transition screen
  window.setTimeout(() => {
    game = new Game(playerNames);
    clearScreen();
    createPlayerArea();
    createQuitButton();
    updateBoard();
  }, 500);
}

function removeHide(e) {
  if (e.classList.contains('hide')) {
    e.classList.remove('hide');
  } else {
    e.classList.add('hide');
  }
}

if (typeof module !== 'undefined') {
  module.exports = domMethods;
} else {
  $("#start-btn").on("click", transitionToGame);
}
$("#start-btn").click();