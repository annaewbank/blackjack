/*
  Codeworks Blackjack Game
  Developed by: Anna Ewbank
  Game tutorial: Code Blackjack with JavaScript HTML CSS - Kenny Yip Coding (YouTube)
  Modal tutorial: The Complete JavaScript Course 2024: From Zero to Expert! - Jonas Schmedtmann (Udemy)
  Please note, both tutorials were only used as a starting point
  Date: November 17, 2023
*/

"use strict";

// GLOBAL VARIABLES
let deck = [];
const values = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];
const suits = ["H", "D", "S", "C"];
const hitButton = document.getElementById("hit");
const standButton = document.getElementById("stand");
const replayButton = document.getElementById("new-game");
let playerCanHit = true; // Allows the player to draw while playerRoundScore < 21
let standButtonClicked = false; // Replay button can be clicked when standButtonClicked = true

// Player variables
const playerCards = document.getElementById("your-cards");
let playerAceCount = 0; // Tracks how many aces the player has
let playerRoundScore;

// Dealer variables
const dealerCards = document.getElementById("dealer-cards");
let dealerHiddenCard; // Tracks the dealer's hidden card
let dealerHiddenCardImg = document.getElementById("hidden");
let dealerAceCount = 0; // Tracks how many aces the dealer has
let dealerRoundScore;

// Modal variables
const rulesButton = document.getElementById("rules-modal");
const rulesModal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const closeModalButton = document.querySelector(".close-modal");

// FUNCTIONS
// Function to build the deck
const buildDeck = function () {
  for (let i = 0; i < suits.length; i++) {
    for (let j = 0; j < values.length; j++) {
      deck.push(`${values[j]}-${suits[i]}`);
    }
  }
};

// Function to shuffle the deck
const shuffleDeck = function () {
  for (let i = 0; i < deck.length; i++) {
    let shuffledLocation = Math.floor(Math.random() * deck.length);
    let temporaryLocation = deck[i];
    // Switch the current location (deck[i]) with the shuffled location
    deck[i] = deck[shuffledLocation];
    deck[shuffledLocation] = temporaryLocation;
  }
};

// Function to retrieve the value of a card
const getCardValue = function (card) {
  let [cardValue, cardSuit] = card.split("-");

  // If A, J, Q, K, assign 11 or 10 , else, assign face value
  if (
    cardValue == "A" ||
    cardValue == "J" ||
    cardValue == "Q" ||
    cardValue == "K"
  ) {
    if (cardValue == "A") {
      return 11;
    } else {
      return 10;
    }
  } else {
    return Number(cardValue);
  }
};

// Function to check if the card is an ace
const checkIfAce = function (card) {
  if (card[0] === "A") {
    return 1;
  } else {
    return 0;
  }
};

// Function to reduce the value of A from 11 to 1 when score > 21
const reducePlayerAce = function (roundScore, aceCount) {
  while (roundScore > 21 && aceCount > 0) {
    roundScore -= 10;
    aceCount -= 1;
  }
  // Update the ace count in the playerAceCount variable
  playerAceCount = aceCount;

  return roundScore;
};

// Function to reduce the value of A from 11 to 1 when score > 21
const reduceDealerAce = function (roundScore, aceCount) {
  while (roundScore > 21 && aceCount > 0) {
    roundScore -= 10;
    aceCount -= 1;
  }
  // Update the ace count in the playerAceCount variable
  dealerAceCount = aceCount;

  return roundScore;
};

// Function to update the current score text content
const updateRoundScore = function (whichPlayer) {
  document.getElementById("round-score-" + whichPlayer).textContent =
    whichPlayer === "dealer" ? dealerRoundScore : playerRoundScore;
};

// Function to deal a card
const dealACard = function (whichPlayer) {
  let cardImg = document.createElement("img"); // Creates an img tag <img>
  let newCard = deck.pop(); // Assigns newCard variable a value from the deck
  cardImg.src = "./cards/" + newCard + ".png"; // Assigns a source to the img tag
  document.getElementById(whichPlayer + "-cards").append(cardImg); // Appends new img tag to either the player-cards or dealer-cards element

  if (whichPlayer === "dealer") {
    dealerRoundScore += getCardValue(newCard);
    dealerAceCount += checkIfAce(newCard);
    dealerRoundScore = reduceDealerAce(dealerRoundScore, dealerAceCount);
    updateRoundScore("dealer");
  } else {
    playerRoundScore += getCardValue(newCard);
    playerAceCount += checkIfAce(newCard);
    playerRoundScore = reducePlayerAce(playerRoundScore, playerAceCount);
    updateRoundScore("player");

    // Stop round if player goes bust
    if (playerRoundScore > 21) {
      document.getElementById("results").innerText = "Bust!\nDealer wins.";
      document.body.classList.remove("normal-background");
      document.body.classList.add("lose-background");
      playerCanHit = false; // Disable the hit button
      standButtonClicked = true; // Disable the stand button
      replayButton.addEventListener("click", startGame); // Enable the replay button
    }
  }
};

// Function for when the hit button is clicked
const hit = function () {
  // Disable the hit button if score >= 21
  if (playerRoundScore >= 21) {
    playerCanHit = false;
  }

  // Exit the function if playerCanHit is falsy
  if (!playerCanHit) {
    return;
  }

  dealACard("player"); // Else, deal a card
};

// Function for when the stand button is clicked
const stand = function () {
  // Disable the stand button
  if (standButtonClicked) {
    return;
  }

  playerCanHit = false; // Disable the hit button

  // Reveal the hidden card
  document.getElementById("hidden").src =
    "./cards/" + dealerHiddenCard + ".png";
  // Update dealer's score
  dealerRoundScore += getCardValue(dealerHiddenCard);
  // Reduce score if dealer is dealt 2 aces
  if (
    dealerRoundScore + getCardValue(dealerHiddenCard) > 21 &&
    dealerAceCount === 2
  ) {
    dealerRoundScore = 12;
    updateRoundScore("dealer");
  }
  // Deal cards until dealer's score < 17
  while (dealerRoundScore < 17) {
    dealACard("dealer");
  }
  // Update dealer's score
  updateRoundScore("dealer");

  // Add results message and update background colour
  let message = "";
  if (dealerRoundScore > 21) {
    message = "Dealer is bust.\nYou win!";
    document.body.classList.remove("normal-background");
    document.body.classList.add("win-background");
  } else if (playerRoundScore === dealerRoundScore) {
    message = "It's a tie!";
  } else if (playerRoundScore > dealerRoundScore) {
    message = "You win!";
    document.body.classList.remove("normal-background");
    document.body.classList.add("win-background");
  } else if (playerRoundScore < dealerRoundScore) {
    message = "You lose!";
    document.body.classList.remove("normal-background");
    document.body.classList.add("lose-background");
  }
  document.getElementById("results").innerText = message;

  replayButton.addEventListener("click", startGame); // Enable replay button

  standButtonClicked = true; // Update standButtonClicked flag so it can't be clicked again
};

// Function to start/reset the game
function startGame() {
  deck = [];

  // Create shuffled deck
  buildDeck();
  shuffleDeck();

  // Reset background
  document.body.classList.add("normal-background");
  document.body.classList.remove("win-background", "lose-background");

  // Reset round scores and ace counts to 0
  dealerRoundScore = 0;
  playerRoundScore = 0;
  playerAceCount = 0;
  dealerAceCount = 0;

  // Reset playerCanHit and standButtonClicked
  playerCanHit = true;
  standButtonClicked = false;

  // Reset results message
  document.getElementById("results").innerHTML = "";
  document.getElementById("player-cards").innerHTML = "";
  document.getElementById("dealer-cards").innerHTML = "";

  // Remove Replay button event listener
  replayButton.removeEventListener("click", startGame);

  // Deal 2 cards to the dealer
  let cardImg = document.createElement("img"); // Creates an img tag <img>
  dealerHiddenCard = deck.pop(); // Assigns the dealerHiddenCard variable a value from the deck
  dealerAceCount += checkIfAce(dealerHiddenCard); // Updates the dealer's ace count
  cardImg.src = "./cards/BACK.png"; // Assigns a source to the img tag
  cardImg.id = "hidden"; // Assigns an ID to the img tag
  document.getElementById("dealer-cards").append(cardImg); // Appends new img tag to the dealer-cards element
  dealACard("dealer"); // Deal a visible card to the dealer
  updateRoundScore("dealer");

  // Deal 2 cards to the player
  for (let i = 0; i < 2; i++) {
    dealACard("player");
  }

  // Make the hit and stand buttons functional
  hitButton.addEventListener("click", hit);
  standButton.addEventListener("click", stand);
}

startGame();

// MODAL FUNCTIONS
// Create a function to open the modal
const openModal = function () {
  rulesModal.classList.remove("hidden");
  // classList returns a collection of the element's classes
  // Note that the dot selector is not used
  overlay.classList.remove("hidden");
};

// Create a function to close the modal
const closeModal = function () {
  rulesModal.classList.add("hidden");
  overlay.classList.add("hidden");
};

// MODAL EVENT LISTENERS
// Make the rules button functional
rulesButton.addEventListener("click", openModal);

// Close the modal by clicking the cross button
closeModalButton.addEventListener("click", closeModal);

// Close the modal by clicking on the overlay
overlay.addEventListener("click", closeModal);
