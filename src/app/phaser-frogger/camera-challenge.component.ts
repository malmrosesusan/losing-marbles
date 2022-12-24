import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { IonContent } from '@ionic/angular';
import Phaser from 'phaser';

class GameScene extends Phaser.Scene {
    constructor(config: Phaser.Types.Core.GameConfig) {
        super(config);
    }
    private player: any;
    private playerSpeed: number;
    private enemyMaxY: number;
    private enemyMinY: number;
    private flowerGroup: any;
    private randomFlowerspeeds: number[];
    private collisionEmitter: any;
    

    particleBurst(x: number, y: number) {

        //  Position the emitter where the mouse/touch event was
        this.collisionEmitter.setPosition(this.player.x,this.player.y);
        this.collisionEmitter.explode();
    
    }

    init() {
        this.playerSpeed = 1.5;
        this.randomFlowerspeeds = [Math.random() * 2 + 1, Math.random() * 2 + 1, Math.random() * 2 + 1, Math.random() * 2 + 1];
        this.enemyMaxY = 280;
        this.enemyMinY = 20;
    }

    preload() {
        this.load.image('background', 'assets/camera-challenge/background.jpg');
        this.load.image('player', 'assets/camera-challenge/camera.png');
        this.load.image('flower', 'assets/camera-challenge/flower-tall.png');
    }


    create() {
        // background
        const bg = this.add.sprite(0, 0, 'background');
        bg.setOrigin(0, 0);

        // player
        this.player = this.add.sprite((this.sys.game.config.width as number) / 2, 40, 'player');
        this.player.setScale(0.02);

        // group of flowers
        this.flowerGroup = this.physics.add.group({
            key: "flower",
            repeat: 3,
            setXY: {
                x: 30,
                y: 100,
                stepX: 50,
                stepY: 110
            }
        });
        // scale flowers
        Phaser.Actions.ScaleXY(this.flowerGroup.getChildren(), -0.9, -0.9);

        // collitison emitter
        this.collisionEmitter = this.add.particles('player').createEmitter({
            x: 400,
            y: 300,
            on: false,
            speed: { min: -800, max: 800 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.013, end: 0.013},
            blendMode: 'NORMAL',
            //active: false,
            lifespan: 600,
            gravityY: 300
        });
        
        
    }

    override update() {
        // check for active input
        if (this.input.activePointer.isDown) {
            // player moves
            this.player.y += this.playerSpeed;
        }

        // set up flowers
        let flowers = this.flowerGroup.getChildren();
        let numFlowers = flowers.length;

        for (let i = 0; i < numFlowers; i++) {
            // move flower
            flowers[i].x += this.randomFlowerspeeds[i];

            // reverse movement if reached the edges
            if (flowers[i].x >= this.enemyMaxY && this.randomFlowerspeeds[i] > 0) {
                this.randomFlowerspeeds[i] *= -1;
            } else if (flowers[i].x <= this.enemyMinY && this.randomFlowerspeeds[i] < 0) {
                this.randomFlowerspeeds[i] *= -1;
            }

            // collision
            if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), flowers[i].getBounds())) {
                
                this.particleBurst(this.player.x,this.player.y);
                let that = this;
                this.time.delayedCall(800, function() {
                    that.scene.restart();
                  }, [], this);
                break;
            }
        }


    }
  
       


}

@Component({
    selector: 'app-camera-challenge',
    templateUrl: 'camera-challenge.component.html',
    styleUrls: ['camera-challenge.component.scss'],
})
export class CameraChallengeComponent implements OnInit {

    @ViewChild('container', { read: ElementRef }) container: ElementRef<HTMLElement>;

    @ViewChild(IonContent, { static: true }) private content: IonContent;

    phaserGame: Phaser.Game;
    config: Phaser.Types.Core.GameConfig;

    constructor() {

    }

    ngOnInit(): void {
        this.content.getScrollElement().then(scrollElement => {

            this.config = {
                type: Phaser.AUTO,
                width: scrollElement.clientWidth,
                height: scrollElement.clientHeight,
                physics: {
                    default: 'arcade',
                    arcade: {
                        // gravity: { y: 300 },
                        debug: false
                    }
                },
                parent: 'game',
                scene: GameScene
            };
            this.phaserGame = new Phaser.Game(this.config);
        });


    }


    ngAfterViewInit(): void {

    }
}