import { UI } from "/ui/UI"

export class Animation implements UI {
    keyFrames: string[]
    key: number
    length: number
    prefix: string
    suffix: string
    doShow: boolean

    constructor(keyFrames : string [], prefix = "", suffix = "") {
        this.length = keyFrames.length;

        if (this.length === 0) {
            throw "There must be at least one element in keyFrames";
        }

        this.keyFrames = keyFrames;
        this.key = 0;
        this.doShow = false;

        this.prefix = prefix;
        this.suffix = suffix;
    }

    setPrefix(prefix : string) : this {
        this.prefix = prefix;
        return this;
    }

    setSuffix(suffix : string) : this {
        this.suffix = suffix;
        return this;
    }

    show(doShow = true) : this {
        this.doShow = doShow;
        return this;
    }

    nextKeyFrame() : string {
        if (this.key >= this.length) {
            this.key = 0;
        }

        const frame = this.keyFrames[this.key];
        this.key++;

        return frame;
    }

    toString() : string {
        if (!this.doShow) return ``;

        return `${this.prefix}${this.nextKeyFrame()}${this.suffix}`;
    }
}