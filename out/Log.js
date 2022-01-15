// @ts-check
/** @typedef {import(".").NS} NS */

/**
 * For displaying a lot of log lines at once
 * Helpful for showing text in a log window
 */
export class Log {

    /**
     * @param {NS} ns
     */
    constructor(ns) {
        this.ns = ns;
        this.data = [''];
    }

    /**
     * 
     * @param {number} index
     * @param {string} text 
     * @returns {Log}
     */
    set(index, text) {
        while (this.data.length <= index)
            this.data.push('');
        this.data[index] = text;
        return this;
    }

    /**
     * 
     * @param {string} text 
     * @returns {Log}
     */
    add(text) {
        this.set(this.data.length, text);
        return this;
    }

    display() {
        this.ns.clearLog();
        this.ns.print(this.data.join('\n'));
    }
    
    /**
     * @returns {number}
     */
    get length() {
        return this.data.length;
    }
}