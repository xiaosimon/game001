export class WelcomeScene extends Phaser.Scene {
    constructor() {
        super('WelcomeScene');
    }

    preload() {
        this.load.image('background', 'assets/background/bk.jpg');
        this.load.audio('bgm', 'assets/music/gamemusic.mp3');
        this.load.audio('click', 'assets/music/click.mp3');
        this.load.image('cursor', 'assets/UI/hand.png');
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

        const titleText = this.add.text(640, 150, '记忆翻牌游戏', {
            fontSize: '72px',
            fontStyle: 'bold',
            fill: '#ffffff',
            stroke: '#4e4e50',
            strokeThickness: 6,
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#000',
                blur: 5,
                fill: true
            }
        }).setOrigin(0.5);

        this.tweens.add({
            targets: titleText,
            scale: { from: 1, to: 1.05 },
            duration: 1000,
            ease: 'Sine.inOut',
            yoyo: true,
            repeat: -1
        });

        const startBtn = this.add.text(640, 350, '开始游戏', {
            fontSize: '40px',
            fontStyle: 'bold',
            fill: '#ffffff',
            backgroundColor: '#2ecc71',
            padding: { x: 30, y: 15 },
            stroke: '#27ae60',
            strokeThickness: 3,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000',
                blur: 3,
                fill: true
            }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        startBtn.on('pointerdown', () => {
            this.sound.play('click');
            this.scene.start('MainScene');
        });

        startBtn.on('pointerover', () => {
            startBtn.setStyle({ backgroundColor: '#27ae60' });
            startBtn.setScale(1.05);
        });

        startBtn.on('pointerout', () => {
            startBtn.setStyle({ backgroundColor: '#2ecc71' });
            startBtn.setScale(1);
        });

        const settingsBtn = this.add.text(640, 450, '游戏设置', {
            fontSize: '40px',
            fontStyle: 'bold',
            fill: '#ffffff',
            backgroundColor: '#3498db',
            padding: { x: 30, y: 15 },
            stroke: '#2980b9',
            strokeThickness: 3,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000',
                blur: 3,
                fill: true
            }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        settingsBtn.on('pointerdown', () => {
            this.sound.play('click');
            this.showSettings();
        });

        settingsBtn.on('pointerover', () => {
            settingsBtn.setStyle({ backgroundColor: '#2980b9' });
            settingsBtn.setScale(1.05);
        });

        settingsBtn.on('pointerout', () => {
            settingsBtn.setStyle({ backgroundColor: '#3498db' });
            settingsBtn.setScale(1);
        });

        const creditsText = this.add.text(640, 650, '© 2025 记忆翻牌游戏', {
            fontSize: '24px',
            fill: '#95a5a6'
        }).setOrigin(0.5);
    }

    showSettings() {
        const overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.8);
        
        const settingsBox = this.add.rectangle(640, 360, 600, 400, 0x2c3e50);
        settingsBox.setStrokeStyle(4, 0x3498db);

        const title = this.add.text(640, 200, '游戏设置', {
            fontSize: '48px',
            fontStyle: 'bold',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.musicVolume = 0.3;
        this.soundVolume = 1.0;

        const musicLabel = this.add.text(350, 280, '背景音乐:', {
            fontSize: '28px',
            fill: '#ecf0f1'
        }).setOrigin(0.5);

        const musicVolumeText = this.add.text(530, 280, `${Math.round(this.musicVolume * 100)}%`, {
            fontSize: '28px',
            fill: '#2ecc71'
        }).setOrigin(0.5);

        const musicDecrease = this.add.text(420, 280, '-', {
            fontSize: '36px',
            fontStyle: 'bold',
            fill: '#ffffff',
            backgroundColor: '#e74c3c',
            padding: { x: 15, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const musicIncrease = this.add.text(640, 280, '+', {
            fontSize: '36px',
            fontStyle: 'bold',
            fill: '#ffffff',
            backgroundColor: '#2ecc71',
            padding: { x: 15, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        musicDecrease.on('pointerdown', () => {
            this.sound.play('click');
            this.musicVolume = Math.max(0, this.musicVolume - 0.1);
            musicVolumeText.setText(`${Math.round(this.musicVolume * 100)}%`);
            this.bgm.setVolume(this.musicVolume);
        });

        musicIncrease.on('pointerdown', () => {
            this.sound.play('click');
            this.musicVolume = Math.min(1, this.musicVolume + 0.1);
            musicVolumeText.setText(`${Math.round(this.musicVolume * 100)}%`);
            this.bgm.setVolume(this.musicVolume);
        });

        const closeBtn = this.add.text(640, 480, '关闭', {
            fontSize: '36px',
            fontStyle: 'bold',
            fill: '#ffffff',
            backgroundColor: '#e74c3c',
            padding: { x: 40, y: 15 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        closeBtn.on('pointerdown', () => {
            this.sound.play('click');
            overlay.destroy();
            settingsBox.destroy();
            title.destroy();
            musicLabel.destroy();
            musicVolumeText.destroy();
            musicDecrease.destroy();
            musicIncrease.destroy();
            closeBtn.destroy();
        });

        closeBtn.on('pointerover', () => {
            closeBtn.setStyle({ backgroundColor: '#c0392b' });
            closeBtn.setScale(1.05);
        });

        closeBtn.on('pointerout', () => {
            closeBtn.setStyle({ backgroundColor: '#e74c3c' });
            closeBtn.setScale(1);
        });
    }

    update() {}
}
