export class Card {
    constructor(name, desc, num, img) {
        this.name = name;
        this.desc = desc;
        this.num = num;
        this.img = img;
        this.player = null;
    }
    
    discard = currGame => {

    };

    targetPlayer = (currGame) => {

    };

    getFullDesc = () => {

    };
};

export class Guard extends Card {
    constructor() {
        super("Guard", "Name a number other than 1 and choose another player."
            + "\nIf they have that number in their hand, they are knocked out of the round.", 1, "Guard.jpg");
    }
};

export class Priest extends Card {
    constructor() {
        super("Priest", "Look at another player's hand.", 2, "Priest.jpg");
    }
}

export class Baron extends Card {
    constructor() {
        super("Baron", "You and another player secretly compare hands. "
         + "\nThe player with the lower value is out of the round.", 3, "Baron.jpg");
    }
}

export class Handmaid extends Card {
    constructor() {
        super("Handmaid", "Until your next turn, "
         + "ignore all effects from the other players' cards.", 4, "Handmaid.jpg");
    }
}

export class Prince extends Card {
    constructor() {
        super("Prince", "Choose any player (including yourself) "
        + "to discard his or her hand and draw a new card.", 5, "Prince.jpg");
    }
}


export class King extends Card {
    constructor() {
        super("King", "Trade hands with another player of your choice.", 6, "King.jpg")
    }
}

export class Countess extends Card {
    constructor() {
        super("Countess", "If you have this card and the King or Prince in your hand, "
        + "you must discard this card.", 7, "Countess.jpg");
    }
}

export class Princess extends Card {
    constructor() {
        super("Princess", "If you discard this card, you are out of the round.", 8, "Princess.jpg");
    }
}
