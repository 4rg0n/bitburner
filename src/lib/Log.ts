import { NS } from "@ns";

/**
 * For displaying a lot of log lines at once
 * Helpful for showing text in a log window
 */
export class Log {

    ns: NS
    data: string[]

    constructor(ns : NS) {
        this.ns = ns;
        this.data = [''];
    }

    set(index : number, text : string) : Log {
        while (this.data.length <= index)
            this.data.push('');
        this.data[index] = text;
        return this;
    }

    add(text : string) : Log {
        this.set(this.data.length, text);
        return this;
    }

    display() : void {
        this.ns.clearLog();
        this.ns.print(this.data.join('\n'));
    }

    get length() : number {
        return this.data.length;
    }
}