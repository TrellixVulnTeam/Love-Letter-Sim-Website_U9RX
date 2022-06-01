// Deck
class Deck {
    constructor(numOfPlayers) {
        if(numOfPlayers > 4)
            this.expansion = true;
        else
            this.expansion = false;
        this.deckOfCards = [];
        this.discardPlie = [];
    }

    createDeck() {
        //Todo
        if(this.expansion) {

        }
        else {
            for(let i = 0; i < 5; i++)
                this.deckOfCards.push(new Guard());
            this.deckOfCards.push(new Priest());
            this.deckOfCards.push(new Priest());
            this.deckOfCards.push(new Baron());
            this.deckOfCards.push(new Baron());
            this.deckOfCards.push(new Handmaid());
            this.deckOfCards.push(new Handmaid());
            this.deckOfCards.push(new Prince());
            this.deckOfCards.push(new Prince());
            this.deckOfCards.push(new King());
            this.deckOfCards.push(new Countess());
            this.deckOfCards.push(new Princess());
        }
    }

    deleteDeck() {
        this.deckOfCards = [];
    }

    deleteDiscardPile() {
        this.discardPlie = [];
    }

    reset() {
        this.deleteDeck();
        this.deleteDiscardPile();
    }

    shuffleDeck() {
        this.deckOfCards = this.deckOfCards.sort((a, b) => 0.5 - Math.random());
    }

    drawCard() {
        return this.deckOfCards.pop();
    }

    discard(card) {
        this.discardPlie.push(card);
    }
}


// Card 
class Card {
    constructor(name, desc, num, img) {
        this.name = name;
        this.desc = desc;
        this.num = num;
        this.img = img;
        this.player = null;
    }
    
    discard = currGame => {

    }

    targetPlayer = (currGame) => {

    }

    getFullDesc = () => {

    }
}

class Guard extends Card {
    constructor() {
        super("Guard", "Name a number other than 1 and choose another player."
            + "\nIf they have that number in their hand, they are knocked out of the round.", 1, "Guard.jpg");
    }
};

class Priest extends Card {
    constructor() {
        super("Priest", "Look at another player's hand.", 2, "Priest.jpg");
    }
}

class Baron extends Card {
    constructor() {
        super("Baron", "You and another player secretly compare hands. "
         + "\nThe player with the lower value is out of the round.", 3, "Baron.jpg");
    }
}

class Handmaid extends Card {
    constructor() {
        super("Handmaid", "Until your next turn, "
         + "ignore all effects from the other players' cards.", 4, "Handmaid.jpg");
    }
}

class Prince extends Card {
    constructor() {
        super("Prince", "Choose any player (including yourself) "
        + "to discard his or her hand and draw a new card.", 5, "Prince.jpg");
    }
}


class King extends Card {
    constructor() {
        super("King", "Trade hands with another player of your choice.", 6, "King.jpg")
    }
}

class Countess extends Card {
    constructor() {
        super("Countess", "If you have this card and the King or Prince in your hand, "
        + "you must discard this card.", 7, "Countess.jpg");
    }
}

class Princess extends Card {
    constructor() {
        super("Princess", "If you discard this card, you are out of the round.", 8, "Princess.jpg");
    }
}


// Player 
class Player {
    constructor(name) {
        this.name = name;
        this.currCard = null;
        this.drawnCard = null;
        this.currGame = null;
        this.alive = true;
        this.immunity = false;
    }

    playCurrCard() {
        console.log(this.name + " plays " + this.currCard.name);
        this.currGame.discard(this.currCard);
        this.currCard.setPlayer(null);
        this.currCard = this.drawnCard;
        this.drawnCard = null;
    }

    playDrawnCard() {
        console.log(this.name + " plays " + this.drawnCard.name);
        this.currGame.discard(this.drawnCard);
        this.drawnCard.setPlayer(null);
        this.drawnCard = null;
    }

    loseCard() {

    }

    drawCard() {

    }

    showHand() {

    }

    swap(player) {

    }

    hasCountessConditions() {

    }

    deleteInv() {

    }

    reset() {
        this.Player = new Player(this.name);
    }
}

// Game
class Game {
    constructor() {

    }

    
}


// Test
const deck = new Deck(4);
deck.createDeck();
deck.shuffleDeck();
console.log(deck.deckOfCards.length);
for(let i = 0; i < deck.deckOfCards.length; i++)
{
    console.log(deck.deckOfCards[i].name);
}