export class GraphicPosition {
    public number: number = 0;
    public positionPercentage: number = 50;
    public positionPercentageVertical: number = 50;

    public trackingFunc() {
        return this.number;
    }

    constructor(num, positionPerc, positionPercVert?) {
        this.number = num;
        this.positionPercentage = positionPerc;
        if (!isNaN(positionPercVert)) {
            this.positionPercentageVertical = positionPercVert;
        }
    }
};