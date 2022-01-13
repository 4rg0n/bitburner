/** @typedef {import(".").NS} NS */

import { asArray } from "./lib.js";

/**
 * For controlling scripts on a host server attacking another target
 */
export class Runner {

    /**
     * @param {NS} ns
     * @param {string} targetHost
     * @param {string} defaultArgs
     * 
     */
    constructor(ns, targetHost = ns.getHostname(), defaultArgs = '', ramMinFree = 0) {
        this.ns = ns;
        this.targetHost = targetHost;
        this.defaultArgs = defaultArgs;
        this.ramMinFree = ramMinFree;
        this.running = {} 
    }

    threads(script) {
        const free = this.calcRamFree();
        const need = this.ns.getScriptRam(script) + .01;

        return Math.floor(free / need);
    }

    calcRamFree() {
        const free = this.ns.getServerMaxRam(this.targetHost) - this.ns.getServerUsedRam(this.targetHost) - this.ramMinFree;

        if (free < 0) {
            return 0;
        }

        return free;
    }

    /**
     * 
     * @param {string|string[]} scripts 
     * @param {number} threads 
     * 
     * @returns min thread count of all given scripts
     */
    minThreads(scripts, threads = 0) {

        scripts = asArray(scripts);
        const allThreads = [];

        for (let script of scripts) {
            allThreads.push(this.threads(script));
        }
        if (threads > 0) {
            allThreads.push(threads);
        }

        return  Math.min(...allThreads);
    }

    isRunning(script, args = this.defaultArgs) {
        this.running[script + " " + args] = this.ns.isRunning(script, this.targetHost, args);
        return this.running[script];
    }

    async await(scripts, args = this.defaultArgs) {
        scripts = asArray(scripts);

        for (let i in scripts) {
            const script = scripts[i];
            this.ns.print(`Waiting for ${script} (${args}) to finish...`);

            while (this.ns.isRunning(script, this.targetHost, args)) {
                await this.ns.sleep(1000);
            }

            this.ns.print(`${script} (${args}) finished...`);
        }
    }

    async start(scripts, threads = 1, args = this.defaultArgs) {
        if (threads < 1) return;

        let ns = this.ns;
        scripts = asArray(scripts);   
        threads = this.minThreads(scripts, threads);

        if (threads < 1) return;

        for (let i in scripts) {
            while (ns.exec(scripts[i], this.targetHost, threads, args) === 0 && 
                    ns.isRunning(scripts[i], this.targetHost, args) === false) {
                await ns.sleep(1000);
            }
        }
    }

    async finish(scripts, threads = 1, args = this.defaultArgs) {
        scripts = asArray(scripts);

        await this.start(scripts, threads, args);
        await this.await(scripts, args);
    }

    async kill(scripts, args = this.defaultArgs) {
        scripts = asArray(scripts);

        for (let i in scripts) {
            this.ns.kill(scripts[i], this.targetHost, args);
        }
           
        await this.await(scripts, args);
    }
}