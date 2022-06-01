class Player {
    constructor(name) {
        this.name = name;
        this.currCard = null;
        this.drawnCard = null;
        this.currGame = null;
    }

    playCurrCard() {
        console.log(this.name + " plays " + this.currCard.name);
        this.currGame.discard(this.currCard);
        this.currCard.setPlayer(null);
        this.currCard = this.drawnCard;
        this.drawnCard = null;
    }

    playDrawnCard() {
        console.log()
    }
}