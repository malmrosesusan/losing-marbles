import { Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";
import { AnonymousSubject } from "rxjs/internal/Subject";
import { IMinePositions } from "../interfaces/mine-positions.interface";
@Component({
    selector: "app-sinking-marbles",
    templateUrl: "./sinking-marbles.component.html",
    styleUrls: ["./sinking-marbles.component.scss"],
})
export class SinkingMarblesComponent implements OnInit {

    @ViewChild('container', {read: ElementRef}) container: ElementRef<ElementRef>;
    @ViewChild('marbleCanvas') marbleCanvas: ElementRef<HTMLCanvasElement>;
    public context: CanvasRenderingContext2D;
    public screenWidth: number;
    public screenHeight: number;
    public lines: IMinePositions[] = [];

    // An array of mine positions
    public mines: IMinePositions[] = [];

    // Number of rows and colums in the play grid
    public rows: number[] = [1, 2, 3, 4, 5];
    public columns: number[] = [1, 2, 3, 4, 5];

    // Tile that has been clicked on
    public currentTile: IMinePositions | null = null;

    // Stores all tiles clicked
    public clicked: IMinePositions[] = [];

    // Whether to display the mines
    public showMines: boolean = false;

    // If the game has been won or lost
    public gameLost: boolean = false;
    public gameWon: boolean = false;

    // Number of attempts user has left before game will be over
    public attemptsLeft: number = 5;

    /**
     * NgOnInit lifecycle hook.
     */
    ngOnInit(): void {
        this.screenHeight = window.innerHeight;
        this.screenWidth = window.innerWidth;
        this.setMines();
    }

    ngAfterViewInit(): void {
        this.context = this.marbleCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    }
    /**
     * Sets mines in random places.
     * Currently, game requires that every column has a mine in it,
     * with one mine per row.
     * May need to change this to make game more challenging.
     */
    private setMines(): void {
        this.mines = [];

        // shuffle array for x (horz) positions
        const randomXArr: any[] = [0, 1, 2, 3, 4]
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);

        // shuffle array for y (vert) positions
        const randomYArr: any[] = [0, 1, 2, 3, 4]
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);
        
        let index = 0;
        while (index < 5) {
            this.mines.push({
                x: randomXArr[index],
                y: randomYArr[index],
            })
            index++;
        }
        console.log('mines', this.mines);
    }

    /**
     * Determines if a circle/tile has a mine under it.
     * @param x 
     * @param y 
     * @returns 
     */
    public hasMine(x: number, y: number): boolean {
        return this.mines.filter(
            (m) => m.x === x && m.y === y
        ).length
            ? true
            : false;
    }

    /**
     * Records that a tile/circle has been clicked.
     * @param x
     * @param y 
     * @returns 
     */
    public hasBeenClicked(x: number, y: number): boolean {
        return this.clicked.filter(
            (m) => m.x === x && m.y === y
        ).length
            ? true
            : false;
    }

    /**
     * User is only allowed to click tiles:
     * 1. If no tile has been clicked, can only click on first row.
     * 2. If tile has been clicked, then only on a row that hasn't been clicked yet, and
     * only tile that is adjacent. Which means a tile to the bottom left, bottom, or bottom right.
     * @param x 
     * @param y 
     * @returns 
     */
    public isClickable(x: number, y: number): void | boolean {
        if (!this.attemptsLeft) {
            return false;
        }
        if (this.gameLost) {
            return false;
        }
        if (this.currentTile === null && x === 0) {
            return true;
        }
        if (this.clicked.length === x && this.currentTile !== null) {
            const bottomLeft = this.getBottomLeftPosition(this.currentTile.x, this.currentTile.y);
            const bottom = this.getBottomPosition(this.currentTile.x, this.currentTile.y);
            const bottomRight = this.getBottomRightPosition(this.currentTile.x, this.currentTile.y);
            if (y === bottomLeft?.y || y === bottom?.y || y === bottomRight?.y) {
                return true;
            }
        }
        return false;
    }



    /**
     * Circle/tile click handler.
     * @param x 
     * @param y 
     */
    public onClickPosition(x: number, y: number, event:any): void {
        
        this.currentTile = { x: x, y: y }; 
        console.log('event',event);
        if (this.lines.length > 0) {
            console.log(this.lines[this.lines.length-1].x, this.lines[this.lines.length-1].y)
            this.context.beginPath();
            this.context.lineWidth = 8;
            // point to start the line
            this.context.moveTo(event.x, event.y);
            // point to end the line
            this.context.lineTo(this.lines[this.lines.length-1].x, this.lines[this.lines.length-1].y);
            // draws the line
            this.context.strokeStyle = 'powderblue';
            this.context.stroke(); 
        }
        
        this.lines.push({x: event.x, y:event.y});

        if (this.hasMine(x, y)) {
            this.gameLost = true;
            this.attemptsLeft = this.attemptsLeft - 1;
        }
        this.clicked.push({ x: x, y: y });
        this.isClickable(x, y);
        if (this.clicked.length === 5) {
            //this.showMines = true;

            if (!this.gameLost) {
                this.gameWon = true;
            }

        }

    }

    /**
     * Gives the user another try (mines are not repositioned)
     */
    public onClickTryAgain(): void {
        this.clicked = [];
        this.context.clearRect(0, 0, this.screenWidth, this.screenHeight);
        this.context.beginPath();
        this.lines = [];
        this.currentTile = null;
        this.gameLost = false;
    }

    /**
     * Resets game when game is over. This means the mines are re-positioned.
     */
    public onClickResetGame(): void {
        this.currentTile = null;
        this.context.clearRect(0, 0, this.screenWidth, this.screenHeight);
        this.context.beginPath();
        this.lines = [];
        this.clicked = [];
        this.gameLost = false;
        this.gameWon = false;
        this.showMines = false;
        this.attemptsLeft = 5;
        this.setMines();
    }
    
    
     /**
     * Gets the tile position to the bottom right. Used to determine if a tile exists
     * adjacent to the current tile.
     * @param x 
     * @param y 
     * @returns 
     */
     public getBottomRightPosition(x: number, y: number): IMinePositions | null {
        // 2, 2
        if (x === 4 || y === 4) {
            return null;
        }
        else {
            return { x: x + 1, y: y + 1 }
        }
    }

     /**
     * Gets the tile position to the bottom. Used to determine if a tile exists
     * adjacent to the current tile.
     * @param x 
     * @param y 
     * @returns 
     */
    public getBottomPosition(x: number, y: number): IMinePositions | null {
        // 2, 2
        if (x === 4) {
            return null;
        }
        else {
            return { x: x + 1, y: y }
        }
    }

    /**
     * Gets the tile position to the bottom left. Used to determine if a tile exists
     * adjacent to the current tile.
     * @param x 
     * @param y 
     * @returns 
     */
    public getBottomLeftPosition(x: number, y: number): IMinePositions | null {
        // 2, 2
        if (x === 4 || y === 0) {
            return null;
        }
        else {
            return { x: x + 1, y: y - 1 }
        }
    }
    /**
     * Because user can only progress down the rows, getting any positions that aren't on row below
     * is not needed, but leaving these here in case they're useful.
    
    public getTopPosition(x: number, y: number): IMinePositions | null {
        //2,2
        if (x === 0) {
            return null;
        }
        else {
            return { x: x - 1, y: y }
        }
    }
    public getTopRightPosition(x: number, y: number): IMinePositions | null {
        // 2,2
        if (x === 0 || y === 4) {
            return null;
        }
        else {
            return { x: x - 1, y: y + 1 }
        }
    }
    public getRightPosition(x: number, y: number): IMinePositions | null {
        // 2,2
        if (y === 4) {
            return null;
        }
        else {
            return { x: x, y: y + 1 }
        }
    }
    public getLeftPosition(x: number, y: number): IMinePositions | null {
        // 2, 2
        if (y === 0) {
            return null;
        }
        else {
            return { x: x, y: y - 1 }
        }
    }
    public getTopLeftPosition(x: number, y: number): IMinePositions | null {
        // 2, 2
        if (x === 0 || y === 0) {
            return null;
        }
        else {
            return { x: x - 1, y: y - 1 }
        }
    }
    */
}

