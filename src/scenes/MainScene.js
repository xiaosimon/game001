export class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
    }

    preload() {
        this.load.image('background', 'assets/background/bk.jpg');
        this.load.image('cursor', 'assets/UI/hand.png');
        this.load.audio('bgm', 'assets/music/gamemusic.mp3');
        this.load.audio('click', 'assets/music/click.mp3');
        this.load.audio('match', 'assets/music/match.mp3');
        this.load.audio('final', 'assets/music/final.mp3');
        this.load.image('card-back', 'assets/poker/Back.png');

        const suits = ['Spades', 'Hearts', 'Diamonds', 'Clubs'];
        const cardImages = ['01', '02', '03', '04', '05', '06', '07', '08'];

        for (let i = 0; i < 8; i++) {
            const suit = suits[i % 4];
            const cardNumber = cardImages[Math.floor(i / 4)];
            this.load.image(`card-front-${i + 1}`, `assets/poker/${suit}/${cardNumber}.png`);
        }
    }

    create() {
        this.add.rectangle(640, 360, 1280, 720, 0x1a1a2e);
        this.add.image(640, 360, 'background').setDisplaySize(1280, 720);

        this.input.setDefaultCursor('url(assets/UI/hand.png), pointer');
        this.bgm = this.sound.add('bgm', { loop: true, volume: 0.3 });
        this.bgm.play();

        this.events.on('shutdown', () => {
            if (this.bgm && typeof this.bgm.stop === 'function') {
                this.bgm.stop();
            }
        });

        this.cards = [];
        this.flippedCards = [];
        this.canFlip = true;
        this.moves = 0;
        this.matches = 0;
        this.totalPairs = 8;

        const cardData = [];
        for (let i = 1; i <= this.totalPairs; i++) {
            cardData.push(i);
            cardData.push(i);
        }
        Phaser.Utils.Array.Shuffle(cardData);

        const cardWidth = 87;
        const cardHeight = 122;
        const paddingX = 5;
        const paddingY = 10;
        const startX = (1280 - (4 * cardWidth + 3 * paddingX)) / 2 + cardWidth / 2;
        const startY = (720 - (4 * cardHeight + 3 * paddingY)) / 2 + cardHeight / 2;

        let index = 0;
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (index >= cardData.length) break;
                const cardId = cardData[index];
                const x = startX + col * (cardWidth + paddingX);
                const y = startY + row * (cardHeight + paddingY);

                const card = this.createCard(x, y, cardId, index);
                this.cards.push(card);
                index++;
            }
        }

        this.add.text(640, 30, '记忆翻牌游戏', {
            fontSize: '48px',
            fontStyle: 'bold',
            fill: '#ffffff',
            stroke: '#4e4e50',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.movesText = this.add.text(640, 80, `步数: ${this.moves}`, {
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.restartBtn = this.add.text(640, 680, '重新开始', {
            fontSize: '28px',
            fill: '#ffffff',
            backgroundColor: '#4e4e50',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.restartBtn.on('pointerdown', () => this.restartGame());
        this.restartBtn.on('pointerover', () => this.restartBtn.setStyle({ backgroundColor: '#6b6b6d' }));
        this.restartBtn.on('pointerout', () => this.restartBtn.setStyle({ backgroundColor: '#4e4e50' }));
    }

    createCard(x, y, cardId, index) {
        const container = this.add.container(x, y);

        const backSprite = this.add.image(0, 0, 'card-back')
            .setInteractive()
            .setData('cardId', cardId)
            .setData('isFlipped', false)
            .setData('container', container);

        const imageSprite = this.add.image(0, 0, `card-front-${cardId}`).setVisible(false);

        container.add([backSprite, imageSprite]);
        container.setSize(120, 120);

        backSprite.on('pointerdown', () => this.flipCard(backSprite, imageSprite));
        backSprite.on('pointerover', () => {
            this.tweens.add({
                targets: backSprite,
                scale: 1.1,
                duration: 150
            });
        });
        backSprite.on('pointerout', () => {
            this.tweens.add({
                targets: backSprite,
                scale: 1,
                duration: 150
            });
        });

        return { back: backSprite, image: imageSprite, container, cardId };
    }

    flipCard(backSprite, imageSprite) {
        if (!this.canFlip || backSprite.getData('isFlipped')) return;
        if (this.flippedCards.length >= 2) return;

        this.sound.play('click');
        backSprite.setData('isFlipped', true);
        backSprite.setData('imageSprite', imageSprite);
        this.flippedCards.push(backSprite);

        this.tweens.add({
            targets: backSprite,
            scaleX: 0,
            duration: 200,
            onComplete: () => {
                backSprite.setVisible(false);
                imageSprite.setVisible(true);
                imageSprite.scaleX = 0;
                
                this.tweens.add({
                    targets: imageSprite,
                    scaleX: 1,
                    duration: 200
                });
            }
        });

        if (this.flippedCards.length === 2) {
            this.moves++;
            this.movesText.setText(`步数: ${this.moves}`);
            this.checkMatch();
        }
    }

    checkMatch() {
        this.canFlip = false;
        const [card1, card2] = this.flippedCards;

        if (card1.getData('cardId') === card2.getData('cardId')) {
            this.sound.play('match');
            this.matches++;
            this.flippedCards = [];
            this.canFlip = true;

            if (this.matches === this.totalPairs) {
                this.sound.play('final');
                this.showWinMessage();
            }
        } else {
            this.time.delayedCall(1000, () => {
                this.flipBack(card1, card2);
            });
        }
    }

    flipBack(card1, card2) {
        const image1 = card1.getData('imageSprite');
        const image2 = card2.getData('imageSprite');

        this.tweens.add({
            targets: [image1, image2],
            scaleX: 0,
            duration: 200,
            onComplete: () => {
                image1.setVisible(false);
                image2.setVisible(false);
                card1.setVisible(true);
                card2.setVisible(true);
                card1.scaleX = 0;
                card2.scaleX = 0;
                card1.setData('isFlipped', false);
                card2.setData('isFlipped', false);
                
                this.tweens.add({
                    targets: [card1, card2],
                    scaleX: 1,
                    duration: 200
                });
            }
        });

        this.flippedCards = [];
        this.canFlip = true;
    }

    showWinMessage() {
        this.tweens.add({
            targets: this.movesText,
            scale: 1.2,
            duration: 300,
            yoyo: true,
            repeat: 2
        });
        this.time.delayedCall(1000, () => {
            this.movesText.setText(`恭喜！你用了 ${this.moves} 步完成游戏！`);
            
            this.backBtn = this.add.text(640, 550, '返回主菜单', {
                fontSize: '32px',
                fill: '#ffffff',
                backgroundColor: '#3498db',
                padding: { x: 20, y: 10 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            this.backBtn.on('pointerdown', () => {
                this.backToWelcome();
            });
            this.backBtn.on('pointerover', () => this.backBtn.setStyle({ backgroundColor: '#2980b9' }));
            this.backBtn.on('pointerout', () => this.backBtn.setStyle({ backgroundColor: '#3498db' }));
        });
    }

    restartGame() {
        this.scene.restart();
    }

    backToWelcome() {
        if (this.bgm && typeof this.bgm.stop === 'function') {
            this.bgm.stop();
        }
        this.scene.start('WelcomeScene');
    }

    update() {}
}