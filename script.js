/*
  Codeworks Blackjack Game
  Developed by: Anna Ewbank
  Date: November 19, 2023
  Game tutorial: Code Blackjack with JavaScript HTML CSS - Kenny Yip Coding (YouTube)
  Modal tutorial: The Complete JavaScript Course 2024: From Zero to Expert! - Jonas Schmedtmann (Udemy)
  Please note, both tutorials were only used as a starting point
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
const hitButton = $("#hit");
const standButton = $("#stand");
const replayButton = $("#new-game");
let playerCanHit = true; // Allows the player to draw while playerRoundScore < 21
let standButtonClicked = false; // Replay button can be clicked when standButtonClicked = true
let dealingInProgress = false;

// Player variables
const playerCards = $("#player-cards");
let playerAceCount = 0; // Tracks how many aces the player has
let playerRoundScore;

// Dealer variables
const dealerCards = $("#dealer-cards");
let dealerHiddenCard; // Tracks the dealer's hidden card
let dealerHiddenCardImg = $("#hidden");
let dealerAceCount = 0; // Tracks how many aces the dealer has
let dealerRoundScore;

// Modal variables
const rulesButton = $("#rules-modal");
const rulesModal = $(".modal");
const overlay = $(".overlay");
const closeModalButton = $(".close-modal");

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
  $("#round-score-" + whichPlayer).text(
    whichPlayer === "dealer" ? dealerRoundScore : playerRoundScore
  );
};

// Function to deal a card
const dealACard = function (whichPlayer) {
  let newCard = deck.pop();

  if (whichPlayer === "dealer") {
    dealerCards.append($("<img>").attr("src", "./cards/" + newCard + ".png"));
    dealerRoundScore += getCardValue(newCard);
    dealerAceCount += checkIfAce(newCard);
    dealerRoundScore = reduceDealerAce(dealerRoundScore, dealerAceCount);
    updateRoundScore("dealer");
  } else if (whichPlayer === "player") {
    playerCards.append($("<img>").attr("src", "./cards/" + newCard + ".png"));
    playerRoundScore += getCardValue(newCard);
    playerAceCount += checkIfAce(newCard);
    playerRoundScore = reducePlayerAce(playerRoundScore, playerAceCount);
    updateRoundScore("player");

    // Stop round if player goes bust
    if (playerRoundScore > 21) {
      $("#results").text("Bust!\nDealer wins.");
      $("body").removeClass("normal-background").addClass("lose-background");
      playerCanHit = false; // Disable the hit button
      standButtonClicked = true; // Disable the stand button
      replayButton.on("click", startGame); // Enable the replay button
    }
  }
};

// Function for when the hit button is clicked
const hit = function () {
  // Disable the hit button if score >= 21
  if (playerRoundScore >= 21 || dealingInProgress) {
    playerCanHit = false;
    return;
  }

  // Exit the function if playerCanHit is falsy
  if (!playerCanHit) {
    return;
  }

  dealingInProgress = true; // Set the flag to indicate dealing is in progress
  dealACard("player");

  // Enable the hit button after a short delay
  setTimeout(() => {
    dealingInProgress = false;
    playerCanHit = true;
  }, 500);
  /*
  dealingInProgress and setTimeout()
  Credit: ChatGPT
  I originally made my game without jQuery and everything worked. However, when adding jQuery, occasionally when pressing 'Hit', the player would be dealt more that one card. I'm not sure why this started to happen - the 'Hit' button was only clicked once, but adding a dealingInProgress flag and a setTimeout() function to disable and enable the hit button seems to have fixed it.
*/
};

// Function for when the stand button is clicked
const stand = function () {
  // Disable the stand button
  if (standButtonClicked) {
    return;
  }

  playerCanHit = false; // Disable the hit button

  // Reveal the hidden card
  $("#hidden").attr("src", "./cards/" + dealerHiddenCard + ".png");
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
  // Deal cards until dealer's score > 17
  while (dealerRoundScore < 17) {
    dealACard("dealer");
  }
  // Update dealer's score
  updateRoundScore("dealer");

  // Add results message and update background colour
  let message = "";
  if (dealerRoundScore > 21) {
    message = "Dealer is bust.\nYou win!";
    $("body").removeClass("normal-background").addClass("win-background");
  } else if (playerRoundScore === dealerRoundScore) {
    message = "It's a tie!";
  } else if (playerRoundScore > dealerRoundScore) {
    message = "You win!";
    $("body").removeClass("normal-background").addClass("win-background");
  } else if (playerRoundScore < dealerRoundScore) {
    message = "You lose!";
    $("body").removeClass("normal-background").addClass("lose-background");
  }
  $("#results").text(message);

  replayButton.on("click", startGame); // Enable replay button

  standButtonClicked = true; // Update standButtonClicked flag so it can't be clicked again
};

// ---

// Function to start/reset the game
function startGame() {
  deck = [];

  // Create shuffled deck
  buildDeck();
  shuffleDeck();

  // Reset background
  $("body")
    .addClass("normal-background")
    .removeClass("win-background lose-background");

  // Reset round scores and ace counts to 0
  dealerRoundScore = 0;
  playerRoundScore = 0;
  playerAceCount = 0;
  dealerAceCount = 0;

  // Reset playerCanHit and standButtonClicked
  playerCanHit = true;
  standButtonClicked = false;

  // Reset results message
  $("#results").html("");
  playerCards.html("");
  dealerCards.html("");

  // Remove Replay button event listener
  replayButton.off("click", startGame);

  // Deal 2 cards to the dealer
  let cardImg = $("<img>"); // Creates an img tag <img>
  dealerHiddenCard = deck.pop(); // Assigns the dealerHiddenCard variable a value from the deck
  dealerAceCount += checkIfAce(dealerHiddenCard); // Updates the dealer's ace count
  cardImg.attr("src", "./cards/BACK.png"); // Assigns a source to the img tag
  cardImg.attr("id", "hidden"); // Assigns an ID to the img tag
  dealerCards.append(cardImg); // Appends new img tag to the dealer-cards element
  dealACard("dealer"); // Deal a visible card to the dealer
  updateRoundScore("dealer");

  // Deal 2 cards to the player
  for (let i = 0; i < 2; i++) {
    dealACard("player");
  }

  // Make the hit and stand buttons functional
  hitButton.on("click", hit);
  standButton.on("click", stand);
}

startGame();

// MODAL FUNCTIONS
// Create a function to open the modal
const openModal = function () {
  rulesModal.removeClass("hidden");
  overlay.removeClass("hidden");
};

// Create a function to close the modal
const closeModal = function () {
  rulesModal.addClass("hidden");
  overlay.addClass("hidden");
};

// MODAL EVENT LISTENERS
// Make the rules button functional
rulesButton.on("click", openModal);

// Close the modal by clicking the cross button
closeModalButton.on("click", closeModal);

// Close the modal by clicking on the overlay
overlay.on("click", closeModal);
