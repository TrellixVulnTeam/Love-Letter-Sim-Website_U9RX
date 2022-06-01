import * as cd from "./server/game/Card.js";

export class Deck {
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
                this.deckOfCards.push(new cd.Guard());
            this.deckOfCards.push(new cd.Priest());
            this.deckOfCards.push(new cd.Priest());
            this.deckOfCards.push(new cd.Baron());
            this.deckOfCards.push(new cd.Baron());
            this.deckOfCards.push(new cd.Handmaid());
            this.deckOfCards.push(new cd.Handmaid());
            this.deckOfCards.push(new cd.Prince());
            this.deckOfCards.push(new cd.Prince());
            this.deckOfCards.push(new cd.King());
            this.deckOfCards.push(new cd.Countess());
            this.deckOfCards.push(new cd.Princess());
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