export class GraphicPosition {
    public number: number = 0;
    public positionPercentage: number = 50;
    public positionPercentageVertical: number = 50;

    public trackingFunc() {
        return this.number;
    }

    constructor(num: number, positionPerc: number, positionPercVert?: number) {
        this.number = num;
        this.positionPercentage = positionPerc;
        if (positionPercVert !== undefined && !isNaN(positionPercVert)) {
            this.positionPercentageVertical = positionPercVert;
        }
    }
};