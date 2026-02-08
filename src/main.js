import { WelcomeScene } from './scenes/WelcomeScene.js';
import { MainScene } from './scenes/MainScene.js';
import { gameConfig } from './config.js';

// 添加场景到配置
gameConfig.scene = [
    WelcomeScene,
    MainScene
];

new Phaser.Game(gameConfig);
            