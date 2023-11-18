export interface shipProps {
    type: string,
    size: number,
}

export class Ship {
    type: string = 'small'
    size: number
    hits: number = 0
    key

    constructor(type: string, size: number) {
        this.size = size;
        this.type = type;
        this.key = crypto.randomUUID()
    }

    public isSunk = () => { return this.hits >= this.size ? true : false };

    public takeHit() {
        this.hits++
    }
}