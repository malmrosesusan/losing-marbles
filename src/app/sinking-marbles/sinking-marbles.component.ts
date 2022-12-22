import { Component, Input, OnInit } from "@angular/core";
import { IMinePositions } from "../interfaces/mine-positions.interface";
@Component({
    selector: "app-sinking-marbles",
    templateUrl: "./sinking-marbles.component.html",
    styleUrls: ["./sinking-marbles.component.scss"],
})
export class SinkingMarblesComponent implements OnInit {
    @Input() name?: string;
    public mines: IMinePositions[] = [];
    public rows: Number[] = [1, 2, 3, 4, 5];
    public columns: Number[] = [1, 2, 3, 4, 5];

    ngOnInit(): void {
        this.mines = [
            {
                x: 1,
                y: 1,
            },
            {
                x: 2,
                y: 2,
            },
            {
                x: 3,
                y: 3,
            },
            {
                x: 4,
                y: 4,
            },
            {
                x: 5,
                y: 5,
            },
        ];
    }

    public hasMine(position: IMinePositions): boolean {
        return this.mines.filter(
            (m) => m.x === position.x && m.y === position.y
        ).length
            ? true
            : false;
    }
}

