
export interface shipProps {
    type: string,
    size: number,
}

export class Ship {
    type: string = 'small'
    size: number = 2
    hits: number = 0
    isSunk = this.hits >= this.size ? true : false

    constructor(type: string, size: number) {
        this.size = size;
        this.type = type;
    }

    public takeHit() {
        this.hits++
    }
}