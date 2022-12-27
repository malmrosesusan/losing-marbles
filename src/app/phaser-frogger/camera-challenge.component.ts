import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { IonContent } from '@ionic/angular';
import Phaser from 'phaser';
import { BaseScene } from 'phaser-utility/scenes/BaseScene';
import { Align } from 'phaser-utility';


class GameScene extends BaseScene {
    constructor(config: Phaser.Types.Core.GameConfig) {
        super("GameScene");
    }
    private player: Phaser.GameObjects.Sprite;
    //private filmRoll: Phaser.GameObjects.Sprite;
    private playerSpeed: number;
    private enemyMaxY: number;
    private enemyMinY: number;
    private flowerGroup: Phaser.Physics.Arcade.Group;
    private donutGroup: Phaser.Physics.Arcade.Group;
    // private grassGroup: Phaser.Physics.Arcade.Group;
    private randomEnemySpeeds: number[];
    private collisionEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private bg1: Phaser.GameObjects.Image;
    private bg2: Phaser.GameObjects.Image;


    init() {
        this.playerSpeed = 1.5;
        this.randomEnemySpeeds = [Math.random() * 2 + 1, Math.random() * 2 + 1, Math.random() * 2 + 1, Math.random() * 2 + 1];
        this.enemyMaxY = 280;
        this.enemyMinY = 20;
        //console.log(this.randomEnemySpeeds);
    }

    preload() {
        this.load.image('background', 'assets/camera-challenge/background.jpg');
        this.load.image('player', 'assets/camera-challenge/camera.png');
        this.load.image('flower', 'assets/camera-challenge/flower-tall.png');
        this.load.image('donuts', 'assets/camera-challenge/donuts.png');
        this.load.image('filmRoll', 'assets/camera-challenge/film-roll.png');
        // this.load.image('grass', 'assets/camera-challenge/grass.png');
    }


    override create() {
        super.create();

        //get the game's width and height
        //let width: number = this.getW();
        let height: number = this.getH();

        // background
        //const bg = this.add.sprite(0, 0, 'background');
        this.bg1 = this.add.image(0, 0, 'background').setOrigin(0, 0);
        this.bg2 = this.add.image(0, height, 'background').setOrigin(0, 0);
        Align.scaleToGameH(this.bg1, 1, this);
        Align.scaleToGameH(this.bg2, 1, this);


        //create a grid system on the stage
        let rows: number = 6;
        let cols: number = 6;
        this.makeGrid(rows, cols);

        //show the grid for debugging
        //this.grid.show();

        // player
        this.player = this.add.sprite((this.sys.game.config.width as number) / 2, 40, 'player');
        this.player.setScale(0.02);


        //this.cameras.main.setBounds(0, 0, width, height, true);
        //this.cameras.main.setSize(width, height);
        this.cameras.main.startFollow(this.player, true, 1, 1, 0, -height / 2.3);

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


        // group of donuts
        this.donutGroup = this.physics.add.group({
            key: "donuts",
            repeat: 4,
            setXY: {
                x: 30,
                y: 100 + height,
                stepX: 50,
                stepY: 90
            },

        });
        // scale donuts
        Phaser.Actions.ScaleXY(this.donutGroup.getChildren(), -0.9, -0.9);

        // film 
        //this.filmRoll = this.add.sprite(110, 66 + (height * 2), 'filmRoll');
        //this.filmRoll.setScale(0.05);

        /*
        // group of grass
        this.grassGroup = this.physics.add.group({
            key: "grass",
            repeat: 1,
            setXY: {
                x: 10,
                y: 50, //+ (height * 2),
                stepX: 210,
                stepY: 0
            },

        });
        */
        // scale grass
        //Phaser.Actions.ScaleXY(this.grassGroup.getChildren(), -0.87, -0.87);

        // collitison emitter
        this.collisionEmitter = this.add.particles('player').createEmitter({
            x: 400,
            y: 300,
            on: false,
            speed: { min: -800, max: 800 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.013, end: 0.013 },
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

        // make enemies move
        this.spawnEnemies(this.flowerGroup);
        this.spawnEnemies(this.donutGroup);
        //this.moveFilm();

        // scrolling background with camera 
        // when player collides with second background tile,
        // move first bg below it
        // todo - user tileSprite instead?
        if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.bg2.getBounds())) {
            this.bg1.y = this.bg2.y + this.bg2.height;
        }
        // when player collides with first background tile,
        // move second bg below it
        if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.bg1.getBounds())) {
            this.bg2.y = this.bg1.y + this.bg1.height;
        }

    }

    /*
    private moveFilm(): void {
        let grass = this.grassGroup.getChildren() as Phaser.GameObjects.Sprite[];

        let numGrass = grass.length;
        let speed = this.randomEnemySpeeds[0];
        for (let i = 0; i < numGrass; i++) {
            grass[i].x += speed;
            // reverse movement if reached the edges
            if (grass[i].x >= 150 && speed > 0) {
                speed *= -1;
            } else if (grass[i].x <= 0 && speed < 0) {
                speed *= -1;
            }
        }
    }
    */

    private particleBurst(): void {
        //  Position the emitter where the player was
        this.collisionEmitter.explode(1, this.player.x, this.player.y);

    }


    private spawnEnemies(group: Phaser.Physics.Arcade.Group): void {
        let enemies = group.getChildren() as Phaser.GameObjects.Sprite[];
        let numEnemies = enemies.length;

        for (let i = 0; i < numEnemies; i++) {
            // move enemy
            enemies[i].x += this.randomEnemySpeeds[i];

            // reverse movement if reached the edges
            if (enemies[i].x >= this.enemyMaxY && this.randomEnemySpeeds[i] > 0) {
                this.randomEnemySpeeds[i] *= -1;
            } else if (enemies[i].x <= this.enemyMinY && this.randomEnemySpeeds[i] < 0) {
                this.randomEnemySpeeds[i] *= -1;
            }

            // collision
            if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), enemies[i].getBounds())) {

                this.particleBurst();
                let that = this;
                this.time.delayedCall(800, function () {
                    // uncomment this to allow game to be over
                    //that.scene.restart();
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

}