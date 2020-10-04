export class GameLoop {

    private lastTime: DOMHighResTimeStamp = 0;
    private logicCallback: (deltaTime: number) => void;

    public constructor() {}

    public Start(callback: (deltaTime: number) => void): void {
        this.logicCallback = callback;
        requestAnimationFrame(this.Run.bind(this));
    }

    private Run(timeStamp: DOMHighResTimeStamp): void {
        const deltaTime: number = timeStamp - this.lastTime;
        this.lastTime = timeStamp;
        this.logicCallback(deltaTime / 1000);
        requestAnimationFrame(this.Run.bind(this));
    }
}
