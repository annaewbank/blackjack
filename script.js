/*
  Codeworks Blackjack Game
  Developed by: Anna Ewbank
  Initial tutorial: Code Blackjack with JavaScript HTML CSS - Kenny Yip Coding (YouTube)
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

const playerCards = document.getElementById("your-cards");
let playerAceCount = 0; // Tracks how many aces the player has
let playerRoundScore;

const dealerCards = document.getElementById("dealer-cards");
let dealerHiddenCard; // Tracks the dealer's hidden card
let dealerHiddenCardImg = document.getElementById("hidden");
let dealerAceCount = 0; // Tracks how many aces the dealer has
let dealerRoundScore;

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

  // If A, J, Q, K, assign 11 or 10 , else, assign value
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

// Function to reduce the value of A from 11 to 1 when score < 21
const reducePlayerAce = function (roundScore, aceCount) {
  while (roundScore > 21 && aceCount > 0) {
    roundScore -= 10;
    aceCount -= 1;
  }
  // Update the ace count in the playerAceCount variable
  playerAceCount = aceCount;

  return roundScore;
};

// Function to reduce the value of A from 11 to 1 when score < 21
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
  let cardImg = document.createElement("img"); // Creates img tag: <img>
  let newCard = deck.pop();
  cardImg.src = "./cards/" + newCard + ".png"; // Assign a source to the img tag
  document.getElementById(whichPlayer + "-cards").append(cardImg); // Append new img tag to the dealer-cards element
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

    if (playerRoundScore > 21) {
      document.getElementById("results").innerText = "Bust!\nDealer wins.";
      document.body.classList.remove("normal-background");
      document.body.classList.add("lose-background");
      // Disable the hit and stand button
      playerCanHit = false;
      standButtonClicked = true;
      replayButton.addEventListener("click", startGame);
    }
  }
};

// Function for when the hit button is clicked
const hit = function () {
  // Disable hit if score > 21
  if (playerRoundScore >= 21) {
    playerCanHit = false;
  }

  // Exit the function if playerCanHit is falsy
  if (!playerCanHit) {
    return;
  }

  dealACard("player");
};

// Function for when the stand button is clicked
const stand = function () {
  // Disable the stand button
  if (standButtonClicked) {
    return;
  }

  // Disable the hit button
  playerCanHit = false;

  // Reveal the hidden card
  document.getElementById("hidden").src =
    "./cards/" + dealerHiddenCard + ".png";
  // Update dealer's score
  dealerRoundScore += getCardValue(dealerHiddenCard);
  // Reduce score when dealer is dealt 2 x A
  if (
    dealerRoundScore + getCardValue(dealerHiddenCard) > 21 &&
    dealerAceCount === 2
  ) {
    dealerRoundScore = 12;
    updateRoundScore("dealer");
  }
  // Deal cards until dealer's score >= 17
  while (dealerRoundScore < 17) {
    dealACard("dealer");
  }
  // Update dealer's score
  updateRoundScore("dealer");

  // Add results message
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

  standButtonClicked = true;

  replayButton.addEventListener("click", startGame);
};

// ---

// Function to start the game
function startGame() {
  deck = [];

  // Create shuffled deck
  buildDeck();
  shuffleDeck();

  // Reset background
  document.body.classList.add("normal-background");
  document.body.classList.remove("win-background", "lose-background");

  // Reset round scores to 0
  dealerRoundScore = 0;
  playerRoundScore = 0;

  // Reset ace count
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

  // Assign hidden to the dealer
  let cardImg = document.createElement("img"); // Creates img tag: <img>
  dealerHiddenCard = deck.pop();
  dealerAceCount += checkIfAce(dealerHiddenCard);
  cardImg.src = "./cards/BACK.png"; // Assign a source to the img tag
  cardImg.id = "hidden";
  document.getElementById("dealer-cards").append(cardImg); // Append new img tag to the dealer-cards element
  // Assign visible card to the dealer
  dealACard("dealer");
  updateRoundScore("dealer");

  // Assign 2 cards to the player
  for (let i = 0; i < 2; i++) {
    dealACard("player");
  }

  // Make the hit button functional
  hitButton.addEventListener("click", hit);

  // Make the stand button functional
  standButton.addEventListener("click", stand);
}

startGame();
