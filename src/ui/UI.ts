export interface UI {
    toString() : string
}

export class UIContainer implements UI {
    elements: (UI | string)[]

    constructor(elements : (UI | string)[]) {
        this.elements = elements;
    }

    toString(): string {
        return this.elements.join("");
    }
}