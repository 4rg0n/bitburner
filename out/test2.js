// @ts-check
/** @typedef {import(".").NS} NS */

export const TestConst = {
    test: "test"
}

export class Test {
    /** @param {NS} ns **/
    constructor(ns) {
        this.ns = ns;
    }

    test() {
        this.ns.tprint(this.ns.getServer(this.ns.getHostname()));
    }
}