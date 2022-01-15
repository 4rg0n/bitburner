// @ts-check
/** @typedef {import(".").NS} NS */
import { Cracker } from "./Cracker.js";

/**
 * Able to buy cracks and tor
 */
export class AdvCracker extends Cracker {
    
    /**
     * @param {NS} ns 
     */
    constructor(ns) {
        super(ns);
    }

    buyCracks() {
        let missingCracks = this.getMissingCracks();

        try {
            missingCracks.forEach(prog => {
                if (this.ns.purchaseProgram(prog)) this.ns.toast("Bought new crack: " + prog, "info", 5000);
            });
        } catch (err) {
            this.ns.print("Could not buy any crack: " + err);
        }

        return this.getAvailCracks();
    }

    buyTor() {
        try {
            if (this.ns.purchaseTor()) {
                this.ns.toast("Bought TOR router", "info", 5000);
                return true;
            } 
        } catch(err) {
            // ignore
        }

        this.ns.print("Could not buy TOR router");
        return false;
    }
}