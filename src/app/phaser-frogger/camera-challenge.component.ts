import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import Phaser from 'phaser';

class GameScene extends Phaser.Scene {
    constructor(config: Phaser.Types.Core.GameConfig) {
        super(config);
    }

    preload() {
    }

    create() {
    }

    override update() {
    }
}

@Component({
    selector: 'app-camera-challenge',
    templateUrl: 'camera-challenge.component.html',
    styleUrls: ['camera-challenge.component.scss'],
})
export class CameraChallengeComponent implements OnInit {
    
   // @ViewChild('container', {read: ElementRef}) container: ElementRef<ElementRef>;

    phaserGame: Phaser.Game;
    config: Phaser.Types.Core.GameConfig;

    constructor() {
        this.config = {
            type: Phaser.AUTO,
            width: window.innerWidth * window.devicePixelRatio,
            height:  window.innerHeight * window.devicePixelRatio,
            physics: {
                default: 'arcade'
            },
            parent: 'game',
            scene: GameScene
        };
    }

    ngOnInit(): void {
        this.phaserGame = new Phaser.Game(this.config);
    }
}