// Global variables to track game state
let playerScore = 0;      // Tracks the player's cumulative score
let computerScore = 0;    // Tracks the computer's cumulative score
let playerMove = null;    // Stores the player's current move ('stop' or 'go')
let computerMove = null;  // Stores the computer's current move ('stop' or 'go')

// Payoff matrix defining outcomes for each combination of moves
// Format: [player payoff, computer payoff]
const payoffMatrix = {
    'stop-stop': [-1, -1],      // Both stop: tie, no one scores
    'stop-go': [0, 1],       // Player stops, computer goes: computer wins
    'go-stop': [1, 0],       // Player goes, computer stops: player wins
    'go-go': [-5, -5]         // Both go: crash! Both lose (Nash Equilibrium)
};

// Main function to play a round of the game
function playGame(choice) {
    // Store the player's choice
    playerMove = choice;
    
    // Generate a random choice for the computer (50% stop, 50% go)
    computerMove = Math.random() < 0.5 ? 'stop' : 'go';
    
    // Calculate the outcome and update scores
    calculateOutcome();
    
    // Update the visual display with results
    displayResults();
    
    // Hide action buttons and show reset buttons
    document.getElementById('actionButtons').style.display = 'none';
    document.getElementById('resetButtons').style.display = 'flex';
}

// Function to calculate the outcome based on both players' moves
function calculateOutcome() {
    // Create a key to look up the payoff in the matrix
    const outcomeKey = `${playerMove}-${computerMove}`;
    
    // Get the payoffs for both players from the matrix
    const [playerPayoff, computerPayoff] = payoffMatrix[outcomeKey];
    
    // Update the scores by adding the payoffs
    playerScore += playerPayoff;
    computerScore += computerPayoff;
    
    // Update the score display on the page
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

// Function to display the results of the round
function displayResults() {
    // Hide the initial message
    document.getElementById('message').style.display = 'none';
    
    // Show the result display section
    const resultDisplay = document.getElementById('resultDisplay');
    resultDisplay.style.display = 'block';
    
    // Get the result text element
    const resultText = document.getElementById('resultText');
    
    // Determine the appropriate result message based on the moves
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
        // Both players chose 'go' - this is the Nash Equilibrium
        resultText.textContent = '💥 CRASH! Both went through! Both lose badly. (-5, -5) [Nash Equilibrium]';
        resultText.style.background = '#fef3c7';
    }
    
    // Show the choices display section
    const choicesDisplay = document.getElementById('choicesDisplay');
    choicesDisplay.style.display = 'flex';
    
    // Display the player's choice icon
    const playerChoiceIcon = document.getElementById('playerChoiceIcon');
    playerChoiceIcon.textContent = playerMove === 'stop' ? '🛑' : '🚗';
    
    // Display the computer's choice icon
    const computerChoiceIcon = document.getElementById('computerChoiceIcon');
    computerChoiceIcon.textContent = computerMove === 'stop' ? '🛑' : '🚗';
}

// Function to reset the current round and play again
function resetRound() {
    // Reset move variables to null
    playerMove = null;
    computerMove = null;
    
    // Show the initial message again
    const message = document.getElementById('message');
    message.textContent = "You're at an intersection. Choose your move:";
    message.style.display = 'block';
    
    // Hide the result display
    document.getElementById('resultDisplay').style.display = 'none';
    
    // Hide the choices display
    document.getElementById('choicesDisplay').style.display = 'none';
    
    // Show action buttons again
    document.getElementById('actionButtons').style.display = 'flex';
    
    // Hide reset buttons
    document.getElementById('resetButtons').style.display = 'none';
}

// Function to reset the entire game including scores
function resetGame() {
    // Reset scores to zero
    playerScore = 0;
    computerScore = 0;
    
    // Update score display to show zeros
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
    
    // Reset the round (resets UI and move variables)
    resetRound();
}