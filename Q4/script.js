let playerScore = 0;
let computerScore = 0;
let playerMove = null;
let computerMove = null;

const payoffMatrix = {
    'stop-stop': [-1, -1],
    'stop-go': [0, 1],
    'go-stop': [1, 0],
    'go-go': [-5, -5]
};

function playGame(choice) {
    playerMove = choice;
    computerMove = Math.random() < 0.5 ? 'stop' : 'go';
    calculateOutcome();
    displayResults();

    document.getElementById('actionButtons').style.display = 'none';
    document.getElementById('resetButtons').style.display = 'flex';
}

function calculateOutcome() {
    const outcomeKey = `${playerMove}-${computerMove}`;
    const [playerPayoff, computerPayoff] = payoffMatrix[outcomeKey];

    playerScore += playerPayoff;
    computerScore += computerPayoff;

    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

function displayResults() {
    document.getElementById('message').style.display = 'none';
    const resultDisplay = document.getElementById('resultDisplay');
    resultDisplay.style.display = 'block';

    const resultText = document.getElementById('resultText');

    if (playerMove === 'stop' && computerMove === 'stop') {
        resultText.textContent = 'Both stopped! No one moves. Tie! (-1, -1)';
        resultText.style.background = '#dbeafe';
    } else if (playerMove === 'stop' && computerMove === 'go') {
        resultText.textContent = 'You stopped, computer went! Computer wins this round. (0, +1)';
        resultText.style.background = '#fee2e2';
    } else if (playerMove === 'go' && computerMove === 'stop') {
        resultText.textContent = 'You went, computer stopped! You win this round! (+1, 0)';
        resultText.style.background = '#dcfce7';
    } else {
        resultText.textContent = '💥 CRASH! Both went through! Both lose badly. (-5, -5) [Nash Equilibrium]';
        resultText.style.background = '#fef3c7';
    }

    const choicesDisplay = document.getElementById('choicesDisplay');
    choicesDisplay.style.display = 'flex';

    document.getElementById('playerChoiceIcon').textContent = playerMove === 'stop' ? '🛑' : '🚗';
    document.getElementById('computerChoiceIcon').textContent = computerMove === 'stop' ? '🛑' : '🚗';
}

function resetRound() {
    playerMove = null;
    computerMove = null;

    const message = document.getElementById('message');
    message.textContent = "You're at an intersection. Choose your move:";
    message.style.display = 'block';

    document.getElementById('resultDisplay').style.display = 'none';
    document.getElementById('choicesDisplay').style.display = 'none';
    document.getElementById('actionButtons').style.display = 'flex';
    document.getElementById('resetButtons').style.display = 'none';
}

function resetGame() {
    playerScore = 0;
    computerScore = 0;

    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;

    resetRound();
}
