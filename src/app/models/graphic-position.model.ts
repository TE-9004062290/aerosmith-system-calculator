export default class GraphicPosition {
    public number: number = 0;
    public positionPercentage: number = 50;
  
    public trackingFunc() {
      return this.number;
    }
  
    constructor(num, positionPerc) {
      this.number = num;
      this.positionPercentage = positionPerc;
    }
  }