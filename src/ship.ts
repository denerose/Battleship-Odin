
const shipTypes = ['tiny', 'small', 'big', 'huge']

export class Ship {
    type: string = 'small'
    length: number = 0
    hits: number = 0
    key: string = 'P1'
    isSunk = this.hits >= this.length ? true : false

    constructor(type: string, length: number) {
        this.length = length,
            this.type = type
    }

    public takeHit() {
        this.hits++
    }
}