import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { IonContent } from '@ionic/angular';

// Phaser
import Phaser from 'phaser';
import { BaseScene } from 'phaser-utility/scenes/BaseScene';
import { Align } from 'phaser-utility';

// Data typing
import { ISpritesCells } from '../interfaces/sprites-cells.interface';
import { RowPlacementEnum } from '../enums/row-placement.enum';
import { ICellData } from '../interfaces/cell-data.interface';


class GameScene extends BaseScene {
    constructor(config: Phaser.Types.Core.GameConfig) {
        super("GameScene");
    }
    private player: Phaser.GameObjects.Sprite;
    private bullet: Phaser.GameObjects.Sprite;
    private fallingPieces: Phaser.GameObjects.Sprite[] = [];
    private firing: boolean = false;
    private bounds: any;
    private updateIterations: number;
    private width: number;
    private height: number;
    private nbBlockTypes: number = 10; // 7 possible tetrominoes
    private blockSize: number = 16; // px
    private spriteGrid: Phaser.GameObjects.Sprite[] = [];
    private numGridRows: number = 20;
    private numBlackRows: number = 6;
    private numRandomColorRows: number = 4;
    private numGridCols: number = 20;
    private columnsUsed: number[] = [];

    init() {

    }

    preload() {
        this.load.image('background', 'assets/rainbow-shooter/blackbg.png');
        // this.load.spritesheet('blocks', 'assets/rainbow-shooter/blocks.png', { frameWidth: this.blockSize, frameHeight: this.blockSize });
        this.load.image('color0', 'assets/rainbow-shooter/color0.png');
        this.load.image('color1', 'assets/rainbow-shooter/color1.png');
        this.load.image('color2', 'assets/rainbow-shooter/color2.png');
        this.load.image('color3', 'assets/rainbow-shooter/color3.png');
        this.load.image('color4', 'assets/rainbow-shooter/color4.png');
        this.load.image('color5', 'assets/rainbow-shooter/color5.png');
        this.load.image('color6', 'assets/rainbow-shooter/color6.png');
        this.load.image('color7', 'assets/rainbow-shooter/color7.png');
        this.load.image('color8', 'assets/rainbow-shooter/color8.png');
        this.load.image('color9', 'assets/rainbow-shooter/color9.png');
        this.load.image('color10', 'assets/rainbow-shooter/color10.png');
        this.load.image('color0-highlight', 'assets/rainbow-shooter/color0-highlight.png');
        this.load.image('color1-highlight', 'assets/rainbow-shooter/color1-highlight.png');
        this.load.image('color2-highlight', 'assets/rainbow-shooter/color2-highlight.png');
        this.load.image('color3-highlight', 'assets/rainbow-shooter/color3-highlight.png');
        this.load.image('color4-highlight', 'assets/rainbow-shooter/color4-highlight.png');
        this.load.image('color5-highlight', 'assets/rainbow-shooter/color5-highlight.png');
        this.load.image('color6-highlight', 'assets/rainbow-shooter/color6-highlight.png');
        this.load.image('color7-highlight', 'assets/rainbow-shooter/color7-highlight.png');
        this.load.image('color8-highlight', 'assets/rainbow-shooter/color8-highlight.png');
        this.load.image('color9-highlight', 'assets/rainbow-shooter/color9-highlight.png');
        this.load.image('color10-highlight', 'assets/rainbow-shooter/color10-highlight.png');
        this.load.image('player', 'assets/rainbow-shooter/player.png');
        this.load.image('bullet', 'assets/rainbow-shooter/player.png');
        this.load.image('piece', 'assets/rainbow-shooter/black.png');
    }


    override create() {
        super.create();

        this.bounds = this.physics.world.bounds;

        this.updateIterations = 0;
        //get the game's width and height
        //let width: number = this.getW();
        this.height = this.getH();
        this.width = this.getW();

        // background
        const bg = this.add.image(0, 0, 'background').setOrigin(0, 0);
        Align.scaleToGameH(bg, 1, this);

        this.createRows();
        // player
        this.player = this.add.sprite(((this.numGridCols * this.blockSize) / 2) - this.blockSize, (this.numGridRows * this.blockSize) + this.blockSize, 'player').setOrigin(0, 0);

        this.addNewPlayerPiece();

        // todo figure out how to prevent sprites from being in same column
        const column = this.getColumn();
        const sprite = this.add.sprite(column, 0, 'piece').setOrigin(0, 0).setData({color: 0});
        
        this.fallingPieces.push(sprite);

    }

    override async update() {
        this.updateIterations++;

        // create falling pieces
        if (this.updateIterations % 36 === 0) { // once every 36 updates

            if (this.fallingPieces.length < 6 && this.updateIterations % 72 === 0) {

                // todo figure out how to prevent sprites from being in same column
                const column = this.getColumn();
                const sprite = this.add.sprite(column, 0, 'piece').setOrigin(0, 0);
                this.fallingPieces.push(sprite);
            }
            for (const sprite of this.fallingPieces) {
                sprite.y = sprite.y + this.blockSize;
            }


        }

        // check for active input
        if (this.input.activePointer.isDown && this.firing === false) {
            // create bullet
            const x = this.roundDownNearest(this.input.x, this.blockSize);
            const y = this.roundDownNearest(this.input.y, this.blockSize);

            this.tweens.add({
                targets: this.bullet,
                x: x,
                y: y,
                ease: 'Linear',
                duration: 500,
                onComplete: () => { this.bullet.destroy(); this.addNewPlayerPiece(); this.firing = false }
            });

            this.firing = true;
        }
        // destroy bullet when it leaves world bounds
        if (this.bullet.x > this.bounds.width || this.bullet.y > this.bounds.height || this.bullet.x === 0 || this.bullet.y === 0) {
            this.firing = false;
            this.bullet.destroy();
            this.addNewPlayerPiece();
        }

        // Bullet encountering falling peices
        if (Phaser.Geom.Intersects.RectangleToRectangle(this.bullet.getBounds(), this.fallingPieces[0].getBounds()) && this.firing === true) {
            this.handleSpriteDrop(0);
        }

        if (this.fallingPieces.length > 1) {
            if (Phaser.Geom.Intersects.RectangleToRectangle(this.bullet.getBounds(), this.fallingPieces[1].getBounds()) && this.firing === true) {
                this.handleSpriteDrop(1);
            }
        }
        if (this.fallingPieces.length > 2) {
            if (Phaser.Geom.Intersects.RectangleToRectangle(this.bullet.getBounds(), this.fallingPieces[2].getBounds()) && this.firing === true) {
                this.handleSpriteDrop(2);
            }
        }
        if (this.fallingPieces.length > 3) {
            if (Phaser.Geom.Intersects.RectangleToRectangle(this.bullet.getBounds(), this.fallingPieces[3].getBounds()) && this.firing === true) {
                this.handleSpriteDrop(3);
            }
        }
        if (this.fallingPieces.length > 4) {
            if (Phaser.Geom.Intersects.RectangleToRectangle(this.bullet.getBounds(), this.fallingPieces[4].getBounds()) && this.firing === true) {
                this.handleSpriteDrop(4);
            }
        }
        if (this.fallingPieces.length > 5) {
            if (Phaser.Geom.Intersects.RectangleToRectangle(this.bullet.getBounds(), this.fallingPieces[5].getBounds()) && this.firing === true) {
                this.handleSpriteDrop(5);
            }
        }


    }



    private handleSpriteDrop(index: number): void {
        this.firing = false;
        const sprite = this.fallingPieces[index];

        const y = this.roundDownNearest(sprite.y, this.blockSize) / this.blockSize;
        const newColorNumber = this.getNewColor(y);
        const newColor = this.getColorName(newColorNumber);
        sprite.setTexture(newColor).setData({color: newColorNumber});

        const spritesInRow = this.children.list.filter(spr => spr instanceof Phaser.GameObjects.Sprite).filter(spr => (spr as Phaser.GameObjects.Sprite).x === sprite.x && (spr as Phaser.GameObjects.Sprite).y > ((this.numBlackRows + this.numGridRows)-1) * this.blockSize);
        const highestSpriteInRow = spritesInRow.filter(spr => (spr as Phaser.GameObjects.Sprite).y === Math.min(...spritesInRow.map(o => (o as Phaser.GameObjects.Sprite).y)));
        let moveToY: number = (highestSpriteInRow[0] as Phaser.GameObjects.Sprite).y;
        if (newColorNumber === highestSpriteInRow[0].getData('color')) {
            highestSpriteInRow[0].destroy();
        }
        else {
            moveToY = moveToY - this.blockSize
        }
        

        this.tweens.add({
            targets: sprite,
            x: sprite.x,
            y: moveToY,
            ease: 'Linear',
            duration: 500,
            onComplete: () => { this.addNewPlayerPiece(); this.firing = false; sprite.setTexture(`color${newColorNumber}`) }
        });

        const column = this.getColumn();
        this.fallingPieces.splice(index, 1, this.add.sprite(column, 0, 'piece').setOrigin(0, 0).setData({color: index}));

        this.bullet.destroy();

    }
    

    private getNewColor(y: number): number {
        let colorNumber = 0;
        switch (true) {
            case y === 0:
            case y === 1:
                colorNumber = 0;
                break;
            case y === 2:
            case y === 3:
                colorNumber = 1;
                break;
            case y === 4:
            case y === 5:
                colorNumber = 2;
                break;
            case y === 6:
            case y === 7:
                colorNumber = 3;
                break;
            case y === 8:
            case y === 9:
                colorNumber = 4;
                break;
            case y === 10:
            case y === 11:
                colorNumber = 5;
                break;
            case y === 12:
            case y === 13:
                colorNumber = 6;
                break;
            case y === 14:
            case y === 15:
                colorNumber = 7;
                break;
            case y === 16:
            case y === 17:
                colorNumber = 8;
                break;
            case y === 18:
            case y === 19:
                colorNumber = 9;
                break;
        }
        return colorNumber;
        
    }
    private getColorName(colorNumber: number): string {
        return `color${colorNumber}-highlight`;
    }


    private getColumn(): number {
        let column = Math.floor(Math.random() * this.numGridCols) * this.blockSize;
        if (this.columnsUsed.length && this.columnsUsed.includes(column)) {
            return this.getColumn();
        }
        if (this.columnsUsed.length === this.numGridCols) {
            this.columnsUsed = [];
        }
        this.columnsUsed.push(column);
        return column;
    }
    private roundNearest = (value: number, nearest: number): number => Math.round(value / nearest) * nearest;
    private roundUpNearest = (value: number, nearest: number): number => Math.ceil(value / nearest) * nearest;
    private roundDownNearest = (value: number, nearest: number): number => Math.floor(value / nearest) * nearest;

    private createRows(): void {
        let colorCount = 0;
        for (let y = 0; y < this.numGridRows; y++) {
            if (y % 2 === 0 && y !== 0) {
                colorCount++;
            }
            // while(x < 2) {
            for (let x = 0; x < this.numGridCols; x++) {
                this.spriteGrid.push(
                    this.add.sprite(x * this.blockSize, y * this.blockSize, `color${colorCount}`).setOrigin(0, 0).setData({color: colorCount})
                )
            }

            // }
        }
        for (let y = this.numGridRows; y < this.numBlackRows + this.numGridRows; y++) {
            for (let x = 0; x < this.numGridCols; x++) {
                this.spriteGrid.push(
                    this.add.sprite(x * this.blockSize, y * this.blockSize, `piece`).setOrigin(0, 0)
                )
            }
        }
        for (let y = this.numGridRows + this.numBlackRows; y < this.numRandomColorRows + this.numGridRows + this.numBlackRows; y++) {
            for (let x = 0; x < this.numGridCols; x++) {
                const color = Math.floor(Math.random() * this.nbBlockTypes);
                this.spriteGrid.push(
                    this.add.sprite(x * this.blockSize, y * this.blockSize, `color${color}`).setOrigin(0, 0).setData({color: color})
                )
            }
        }
    }

    private addNewPlayerPiece(): void {
        this.bullet = this.add.sprite(this.player.x, this.player.y, 'bullet').setOrigin(0, 0);
    }

}

@Component({
    selector: 'app-rainbow-shooter',
    templateUrl: 'rainbow-shooter.component.html',
    styleUrls: ['rainbow-shooter.component.scss'],
})
export class RainbowShooterComponent implements OnInit {

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
                        //gravity: { y: 100 },
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