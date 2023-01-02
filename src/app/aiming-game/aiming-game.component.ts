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
    private offsets: any = {
        // 0 X 0
        // X X X
        // 0 X 0 
        0: [[0, -1], [-1, 0], [0, 0], [1, 0], [0, 1]],

        // 0 X 0 
        // X X X 
        // 0 0 0 
        1: [[0, -1], [-1, 0], [0, 0], [1, 0]],

        // 0 0 0 
        // X X X 
        // 0 X 0 
        2: [[-1, 0], [0, 0], [1, 0], [0, 1]],

        // 0 0 0 
        // X X X 
        // 0 0 X 
        3: [[-1, 0], [0, 0], [1, 0], [1, 1]],

        // 0 0 0 
        // X X X 
        // X 0 0 
        4: [[-1, 0], [0, 0], [1, 0], [-1, 1]],

        // X 0 0 
        // X X X 
        // 0 0 X 
        5: [[-1, -1], [-1, 0], [0, 0], [1, 0], [1, 1]],

        // 0 X X 
        // 0 X 0 
        // X X 0 
        6: [[0, -1], [1, -1], [0, 0], [0, 1], [-1, 1]],


        // X X 0 
        // X X 0 
        // 0 0 0 
        7: [[-1, -1], [0, -1], [-1, 0], [0, 0]],
    };
    private player: Phaser.GameObjects.Sprite;
    private bullet: Phaser.GameObjects.Sprite;
    private firing: boolean = false;
    private bounds: any;
    private updateIterations: number;
    private width: number;
    private height: number;
    private topSpritesContainer: Phaser.GameObjects.Zone;
    private nbBlockTypes: number = 7; // 7 possible tetrominoes
    private blockSize: number = 16; // px
    private spriteGrid: ICellData[] = [];
    private numGridRows: number = 32;//32
    private numGridCols: number = 18;
    private nearestBlock: number;
    private movingSprites: Phaser.GameObjects.TileSprite[] = [];

    init() {
        // initialize blank grid
        for (let x = 0; x < this.numGridRows; x++) {
            for (let j = 0; j < this.numGridCols; j++) {
                this.spriteGrid.push(
                    {
                        hasSprite: false,
                        gridPosition: {
                            row: x,
                            column: j
                        }
                    }
                )
            }
        }
    }

    preload() {
        this.load.image('background', 'assets/aiming-game/blackbg.png');
        this.load.spritesheet('blocks', 'assets/aiming-game/blocks.png', { frameWidth: this.blockSize, frameHeight: this.blockSize });
        this.load.image('player', 'assets/aiming-game/player.png');
        this.load.image('bullet', 'assets/aiming-game/player.png');
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

        // player
        this.player = this.add.sprite((this.width / 2) - 20, (this.height / 1.5) - 20, 'player').setOrigin(0, 0);
        this.player.setScale(0.5);

        this.addNewPlayerPiece();

        this.topSpritesContainer = this.add.zone(0, 0, this.blockSize * this.numGridCols, this.blockSize * 3).setOrigin(0, 0);

        this.createRow(RowPlacementEnum.TOP);
        this.createRow(RowPlacementEnum.BOTTOM);

    }

    override async update() {
        this.updateIterations++;
        if (this.updateIterations % 36 === 0 && !this.firing && this.spriteGrid.length) { // once every 36 updates

            // move lower sprites in horizontal loop
            let allSpritesExceptTopRows = this.children.list.filter(x => x instanceof Phaser.GameObjects.TileSprite).filter(spr => (spr as Phaser.GameObjects.TileSprite).y > (this.blockSize * 3));

            // scroll bottom sprites 
            // NOTE: I turned this off. With the sprites scrolling, 
            // there's a bug where detecting their place in the grid is messed up.
            for (const spr of allSpritesExceptTopRows) {

                let xPos = (spr as Phaser.GameObjects.TileSprite).x;
                let yPos = (spr as Phaser.GameObjects.TileSprite).y;
                // moving sprite one block to left
                if (xPos !== 0) {
                    //(spr as Phaser.GameObjects.TileSprite).x = (spr as Phaser.GameObjects.TileSprite).x - this.blockSize;
                }
                // moving sprite to right of screen
                else {
                    //(spr as Phaser.GameObjects.TileSprite).x = (this.blockSize * this.numGridCols) - this.blockSize;
                }

            };
        }

        // check for active input
        if (this.input.activePointer.isDown && this.firing === false) {
            // create bullet
            this.addNewPlayerPiece();
            this.nearestBlock = this.roundNearest(this.input.x, this.blockSize);

            this.tweens.add({
                targets: this.bullet,
                x: this.nearestBlock,
                y: this.blockSize * 3,
                ease: 'Linear',
                duration: 500
            });

            this.firing = true;
        }

        // destroy bullet when it leaves world bounds
        if (this.bullet.x > this.bounds.width || this.bullet.y > this.bounds.height || this.bullet.x < 0 || this.bullet.y < 0) {
            this.firing = false;

        }

        // Bullet encountering the top row
        if (Phaser.Geom.Intersects.RectangleToRectangle(this.bullet.getBounds(), this.topSpritesContainer.getBounds()) && this.firing === true) {
            this.firing = false;
            // bullet will always stop at row 3 of grid, so check if cell above it is empty
            // get column of where bullet landed
            const col = this.nearestBlock / this.blockSize;
            const emptyRow = this.findHighestEmptyCellAboveCell(2, col);

            this.movingSprites = this.getTopSpritesByColumn(col);

            if (emptyRow !== 3) {
                this.tweens.add({
                    targets: this.bullet,
                    x: this.nearestBlock,
                    y: emptyRow * this.blockSize,
                    ease: 'Linear',
                    duration: 200,
                    onComplete: () => this.bullet.destroy()
                });

            }
            else {
                // reset nearestBlock for next time bullet is fired
                this.nearestBlock = 0;
                this.bullet.destroy();
            }
            // this would only be empty if a new one hadn't been filled in yet
            if (this.movingSprites && this.movingSprites.length) {
                this.handleSpriteBottomIntersection();
            }

        }
    }


    private updateSpriteGridFromSprites(): void {
        let allSprites = this.children.list.filter(x => x instanceof Phaser.GameObjects.TileSprite);

        for (const cell of this.spriteGrid) {

            const hasSprite = [...allSprites.filter(spr => {
                return (spr as Phaser.GameObjects.TileSprite).x / this.blockSize === cell.gridPosition.column &&
                    (spr as Phaser.GameObjects.TileSprite).y / this.blockSize === cell.gridPosition.row
            })].length;

            if (hasSprite) {
                cell.hasSprite = true;
            }
            else {
                cell.hasSprite = false;
            }
        }
    }


    private handleSpriteBottomIntersection(): void {

        // find the first column the moving sprites were in
        const leftColSprite = [...this.movingSprites.filter(spr => spr.x === Math.min(...this.movingSprites.map(o => o.x)))];
        const lowestMovingSprites = [...this.movingSprites.filter(spr => spr.y === Math.max(...this.movingSprites.map(o => o.y)))];
        const lowestMovingRow = lowestMovingSprites[0].y;

        let i = 0;
        let cellsLanding: ICellData[] = [];
        this.updateSpriteGridFromSprites();
        while (i < 3) {

            // cells that are landing
            const cell = this.spriteGrid.find(gr => gr.gridPosition.column === (leftColSprite[0].x / this.blockSize) + i && gr.gridPosition.row === lowestMovingRow / this.blockSize) as ICellData;
            console.log('cell', cell);
            cellsLanding.push(cell);
            i++;
        }
        console.log('cellsLanding', cellsLanding);


        let index = 0;
        const numberRowsToMove = this.canMove(cellsLanding, leftColSprite[0].x / this.blockSize);
        console.log('numberRowsToMove', numberRowsToMove);
        for (const spr of this.movingSprites) {
            let isLast = index === this.movingSprites.length - 1;
            if (numberRowsToMove > 0) {
                this.tweens.add({
                    targets: spr,
                    x: spr.x,
                    y: spr.y + (numberRowsToMove * this.blockSize),
                    ease: 'Linear',
                    duration: 400,
                    onComplete: this.updateSpriteGrid(numberRowsToMove, leftColSprite[0].x, isLast)
                });
                index++;
            }
            else {
                console.log('GAME OVER!');
                break;
            }
        }
        //this.movingSprites = [];
    }

    // recursion! todo need to check for game over
    private canMove(cellsMoving: ICellData[], leftCol: number, numberRowsToMove: number = 0): number {
        console.log('leftcol',leftCol);
        // increment number of rows to move
        numberRowsToMove = numberRowsToMove + 1;

        // get the row of cells just below the lowest cells moving
        let nextRow: ICellData[] = [];
        for (const cell of cellsMoving) {
            nextRow = [...nextRow, ...this.spriteGrid.filter(gr => gr.gridPosition.row === cell.gridPosition.row + numberRowsToMove && gr.gridPosition.column === cell.gridPosition.column)];
        }

        // if all cells in next row are empty, keep looking
        let nextRowIsEmpty: boolean = true;
        for (const cell of nextRow) {
            if (cell.hasSprite === true) {
                nextRowIsEmpty = false;
            }
        }
        //if (nextRow.filter(cell => cell.empty === true).length === 3) {
        if (nextRowIsEmpty === true) {
            console.log('empty row -> calling function again');
            return this.canMove(cellsMoving, leftCol, numberRowsToMove);
        }

        // we have a non empty row - determine if shapes fit together
        let moveable: boolean = true;
        // look at cells in all three columns of cells moving and next row
        for (let i = 0; i < 3; i++) {
            if (cellsMoving[i].hasSprite && nextRow[i].hasSprite) {
                console.log('not moveable')
                moveable = false;
            }
        }
        // there is no collision, so keep moving
        if (moveable) {
            return this.canMove(cellsMoving, leftCol, numberRowsToMove);
        }
        // otherwise return number of rows to move!
        return numberRowsToMove - 1;
    }

    private getFullRows(): number[] {
        let fullRows: number[] = [];
        // ignore the first three rows - start index at 2
        for (let i = 2; i < this.numGridRows; i++) {
            const rowBeingChecked = [...this.spriteGrid.filter(gr => gr.gridPosition.row === i)];
            if (rowBeingChecked.filter(gr => gr.hasSprite === true).length === this.numGridCols) {
                fullRows = [...fullRows, i];
            }
        }
        return fullRows;
    }

    // todo - remove rows that are completed/full
    private handleFullRows(): void {
        const fullRows: number[] = this.getFullRows();
        console.log('fullRows', fullRows);
        let allSprites = this.children.list.filter(x => x instanceof Phaser.GameObjects.TileSprite);
        for (const cell of this.spriteGrid) {
            if (cell.gridPosition.row === 30) {
                console.log('cell', cell);
            }
        }
        for (const row of fullRows) {
            const spritesToRemove = allSprites.filter(spr => (spr as Phaser.GameObjects.TileSprite).y / this.blockSize === row);
            // destroy sprites
            spritesToRemove.forEach(spr => spr.destroy());
            // remove from sprite grid
            const cellsInGrid = [...this.spriteGrid.filter(gr => gr.gridPosition.row === row)];
            for (const cell of cellsInGrid) {
                cell.hasSprite = false;
            }
            // move all sprites above row down one row
            const spritesToShiftDown = allSprites.filter((spr) => (spr as Phaser.GameObjects.TileSprite).y / this.blockSize < row && (spr as Phaser.GameObjects.TileSprite).y / this.blockSize > 3);
            console.log('spritesToShiftDown', spritesToShiftDown);
            for (const spr of spritesToShiftDown) {
                this.tweens.add({
                    targets: spr,
                    x: (spr as Phaser.GameObjects.TileSprite).x,
                    y: (spr as Phaser.GameObjects.TileSprite).y + this.blockSize,
                    ease: 'Linear',
                    duration: 400,

                });
            }
        }
    }

    private updateSpriteGrid(numberRowsToMove: number, xOffset: number, isLast: boolean): void {
        if (isLast) {
            // removes moving sprites from cell grid up top;
            this.updateCellsEmptyInGrid();

            // adds moving sprites in cell grid down bottom
            this.updateCellsNotEmptyInGrid(numberRowsToMove);

            // replace shape in top row
            setTimeout(() => {
                this.createTetromino(xOffset, 0);
            }, 1000)

            // update any rows that are complete
            //this.handleFullRows();
        }
    }


    // when sprites move down the screen, need to update the spriteGrid to remove them from
    // their original position
    private updateCellsEmptyInGrid(): void {
        for (const sprite of this.movingSprites) {
            const spriteInGrid = this.spriteGrid.find(spr => spr.gridPosition.column === (sprite.x / this.blockSize) && spr.gridPosition.row === (sprite.y / this.blockSize));
            if (spriteInGrid) {
                spriteInGrid.hasSprite = false;
            }
        }
    }

    // when sprites move down the screen, need to update the spriteGrid to add them to
    // their new position
    private updateCellsNotEmptyInGrid(numberRowsToMove: number): void {
        for (const sprite of this.movingSprites) {
            const spriteInGrid = this.spriteGrid.find(gr => gr.gridPosition.column === sprite.x / this.blockSize && gr.gridPosition.row === (sprite.y / this.blockSize) + numberRowsToMove);
            if (spriteInGrid) {
                if (spriteInGrid.hasSprite) {
                    console.log('GAME OVER');
                }
                spriteInGrid.hasSprite = true;
            }
        }
    }

    // recursion!
    private findHighestEmptyCellAboveCell(row: number, col: number): number {
        if (this.getCellFromGrid(row, col)?.hasSprite) {
            return row + 1;
        }
        row = row - 1;
        return this.findHighestEmptyCellAboveCell(row, col);
    }

    private getTopSpritesByColumn(col: number): Phaser.GameObjects.TileSprite[] {
        let sprites: Phaser.GameObjects.TileSprite[] = [];
        let min = this.roundDownNearest(col, 3) * this.blockSize;
        let max = this.roundUpNearest(col, 3) * this.blockSize;
        this.children.each(child => {
            if (child.type === 'TileSprite') {
                // col 0,1,2 x = 0 through 3 * this.blocksize
                if ((child as Phaser.GameObjects.TileSprite).x >= min && (child as Phaser.GameObjects.TileSprite).x < max && (child as Phaser.GameObjects.TileSprite).y <= 3 * this.blockSize) {
                    sprites.push(child as Phaser.GameObjects.TileSprite);
                }

            }
        });
        return sprites;

    }

    private addNewPlayerPiece(): void {
        this.bullet = this.physics.add.sprite(this.player.x, this.player.y, 'bullet').setOrigin(0, 0).setScale(0.5);
    }

    private roundNearest = (value: number, nearest: number): number => Math.round(value / nearest) * nearest;
    private roundUpNearest = (value: number, nearest: number): number => Math.ceil(value / nearest) * nearest;
    private roundDownNearest = (value: number, nearest: number): number => Math.floor(value / nearest) * nearest;

    // creates row of pieces
    private createRow(rowPlacement: RowPlacementEnum): void {
        let sprites: Phaser.GameObjects.TileSprite[] = [];
        for (let i = 0; i <= 5; i++) { // for every column (creating 6)
            let xOffset = 0;
            let yOffset = 0;
            if (i > 0) {
                xOffset = i * this.blockSize * 3;
            }
            if (rowPlacement === RowPlacementEnum.BOTTOM) {
                yOffset = (this.numGridRows * this.blockSize) - (this.blockSize * 3);
            }
            const result = this.createTetromino(xOffset, yOffset);
            sprites = [...sprites, ...result.sprites];
        }
    }

    private setCellNotEmpty(xOffset: number, yOffset: number, cell: number[]): void {
        const cellRow: number = this.getGridRow(yOffset, cell[1]) as number;
        const cellCol: number = this.getGridColumn(xOffset, cell[0]) as number;
        const gridCell = this.getCellFromGrid(cellRow, cellCol);
        if (gridCell) {
            gridCell.hasSprite = true;
        }
    }

    private getCellFromGrid(row: number, col: number): ICellData | void {
        const cell = this.spriteGrid.find(grid => grid.gridPosition.row === row && grid.gridPosition.column === col);
        if (cell) {
            return cell;
        }
    }

    private getGridColumn(xOffset: number, cellPosX: number): number | void {
        let shapePos = xOffset / this.blockSize;
        const columnInShape = cellPosX + 1;
        return columnInShape + shapePos;
    }

    private getGridRow(yOffset: number, cellPosY: number): number | void {
        let shapePos = yOffset / this.blockSize;
        const rowInShape = cellPosY + 1;
        return rowInShape + shapePos;
    }

    // The tetris shape
    private createTetromino(xOffset: number, yOffset: number): ISpritesCells {
        const color = Math.floor(Math.random() * this.nbBlockTypes);
        const shape = Math.floor(Math.random() * this.nbBlockTypes);
        const sprites: Phaser.GameObjects.TileSprite[] = [];

        for (const cell of this.offsets[shape]) {

            // sprite bottom row
            // add sprite in bottom left corner
            if (cell[0] === -1 && cell[1] === 1) {
                const sprite = this.add.tileSprite(0 + xOffset, this.blockSize * 2 + yOffset, 0, 0, 'blocks', color).setOrigin(0, 0);
                sprites.push(sprite);
                this.setCellNotEmpty(xOffset, yOffset, cell);

            }
            // add sprite in bottom center
            if (cell[0] === 0 && cell[1] === 1) {
                const sprite = this.add.tileSprite(this.blockSize + xOffset, this.blockSize * 2 + yOffset, 0, 0, 'blocks', color).setOrigin(0, 0);
                sprites.push(sprite);
                this.setCellNotEmpty(xOffset, yOffset, cell);
            }
            // add sprite in bottom right corner
            if (cell[0] === 1 && cell[1] === 1) {
                const sprite = this.add.tileSprite(this.blockSize * 2 + xOffset, this.blockSize * 2 + yOffset, 0, 0, 'blocks', color).setOrigin(0, 0);
                sprites.push(sprite);
                this.setCellNotEmpty(xOffset, yOffset, cell);
            }

            // sprite middle row
            // add sprite in middle left 
            if (cell[0] === -1 && cell[1] === 0) {
                const sprite = this.add.tileSprite(0 + xOffset, this.blockSize + yOffset, 0, 0, 'blocks', color).setOrigin(0, 0);
                sprites.push(sprite);
                this.setCellNotEmpty(xOffset, yOffset, cell);
            }
            // add sprite in middle
            if (cell[0] === 0 && cell[1] === 0) {
                const sprite = this.add.tileSprite(this.blockSize + xOffset, this.blockSize + yOffset, 0, 0, 'blocks', color).setOrigin(0, 0);
                sprites.push(sprite);
                this.setCellNotEmpty(xOffset, yOffset, cell);
            }
            // add sprite in middle right
            if (cell[0] === 1 && cell[1] === 0) {
                const sprite = this.add.tileSprite(this.blockSize * 2 + xOffset, this.blockSize + yOffset, 0, 0, 'blocks', color).setOrigin(0, 0);
                sprites.push(sprite);
                this.setCellNotEmpty(xOffset, yOffset, cell);
            }


            // sprite top row
            // add sprite in top left corner
            if (cell[0] === -1 && cell[1] === -1) {
                const sprite = this.add.tileSprite(0 + xOffset, 0 + yOffset, 0, 0, 'blocks', color).setOrigin(0, 0);
                sprites.push(sprite);
                this.setCellNotEmpty(xOffset, yOffset, cell);
            }
            // add sprite in top center
            if (cell[0] === 0 && cell[1] === -1) {
                const sprite = this.add.tileSprite(this.blockSize + xOffset, 0 + yOffset, 0, 0, 'blocks', color).setOrigin(0, 0);
                sprites.push(sprite);
                this.setCellNotEmpty(xOffset, yOffset, cell);
            }
            // add sprite in top right corner
            if (cell[0] === 1 && cell[1] === -1) {
                const sprite = this.add.tileSprite(this.blockSize * 2 + xOffset, 0 + yOffset, 0, 0, 'blocks', color).setOrigin(0, 0);
                sprites.push(sprite);
                this.setCellNotEmpty(xOffset, yOffset, cell);
            }

        }
        return {
            cells: [],//cells,
            sprites: sprites
        }
    }


}

@Component({
    selector: 'app-aiming-game',
    templateUrl: 'aiming-game.component.html',
    styleUrls: ['aiming-game.component.scss'],
})
export class AimingGameComponent implements OnInit {

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