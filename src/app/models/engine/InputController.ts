export const KEYS: Map<KEY_TYPE, string> = new Map<KEY_TYPE, string>([
    ['UP', 'ArrowUp'],
    ['DOWN', 'ArrowDown'],
    ['LEFT', 'ArrowLeft'],
    ['RIGHT', 'ArrowRight']
]);

export type KEY_TYPE = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const REVERSE_KEYS: Map<string, KEY_TYPE> = new Map<string, KEY_TYPE>([
    ['ArrowUp', 'UP'],
    ['ArrowDown', 'DOWN'],
    ['ArrowLeft', 'LEFT'],
    ['ArrowRight', 'RIGHT']
]);

export class InputController {

    public keys: {[key in KEY_TYPE]: boolean} = {
        UP: false,
        DOWN: false,
        LEFT: false,
        RIGHT: false
    };

    public constructor(private keyInputCallback: () => void) {
        this.SetupEventListeners();
    }

    public SetupEventListeners(): void {
        window.addEventListener('keydown', this.onKeyPressed.bind(this));
        window.addEventListener('keyup', this.onKeyUp.bind(this));
    }

    public onKeyPressed(event: KeyboardEvent): void {
        const key: KEY_TYPE = REVERSE_KEYS.get(event.key);
        if (key && !this.keys[key]) {
            this.keys[key] = true;
            this.keyInputCallback();
        }
    }

    public onKeyUp(event: KeyboardEvent): void {
        const key: KEY_TYPE = REVERSE_KEYS.get(event.key);
        if (key && this.keys[key] === true) {
            this.keys[key] = false;
            this.keyInputCallback();
        }
    }
}
