// @ts-check
/** @typedef {import(".").NS} NS */
import { Runner } from "./Runner.js";
import { Zerver } from "./Zerver.js";

/** @typedef {{args: string[], runner: Runner}} RunnerContainer*/

export class RunnerQueue {
    static IdGenerator = {
        None: "None",
        Slots: "Slots",
        Provided: "Provided"
    }

    /**
     * 
     * @param {string} idGen
     * @param {number} homeMinRamFree
     */
    constructor(ns, idGen = RunnerQueue.IdGenerator.None, homeMinRamFree = 0) {
        this.ns = ns;
        /** @type {Object.<string, Object.<string, RunnerContainer[]>>} */
        this.runners = {};
        this.idGen = idGen;
        this.homeMinRamFree = homeMinRamFree;
        this.slotCount = 1;
    }

     /**
     * 
     * @param {Zerver} server 
     * @param {string} target
     * @param {number} id 
     * @returns {Runner[]}
     */
    runner(server, target, id = undefined) {
        const args = this.fingerprint(server, target, id);
        const runners = this.createRunner(server, target, args);

        this.runners[`${server.name}`][`${target}`] = runners;

        return runners.map(r => r.runner);
    }

     /**
     * 
     * @param {Zerver} server 
     * @param {string} target 
     * @param {string[]} args 
     */
    createRunner(server, target, args) {
        let runners = this.getRunners(server.name, target);

        if (!runners) {
            runners = [];
        }

        // max slots reached?
        if (runners.length === this.slotCount) {
            return runners
        }

        if (server.isHome) {
            runners.push({
                runner: new Runner(this.ns, server.name, args, this.homeMinRamFree),
                args: args
            }); 
        } else {
            runners.push({
                runner: new Runner(this.ns, server.name, args),
                args: args
            }); 
        }

        return runners;
    }

    /**
     * 
     * @param {string|string[]} scripts 
     * @param {number} threads 
     * @param {string} host 
     * @param {string} target 
     */
    async start(scripts, threads, host, target) {
        let runners = this.getRunners(host, target);

        // for (const r of runners) {
        //     // already running?
        //     if (r.runner.isRunning(scripts, r.args)) {
        //         continue;
        //     }

        //     await r.runner.start(scripts, threads, r.args);
        // }
    }

     /**
     * 
     * @param {string|string[]} scripts 
     * @param {string} host 
     * @param {string} target 
     */
    async kill(scripts, host, target) {
        let runners = this.getRunners(host, target);

        for (const r of runners) {
            await r.runner.kill(scripts, r.args);
        }
    }

    /**
     * 
     * @param {string} script 
     * @param {string} host 
     * @param {string} target 
     * @returns 
     */
    isRunning(script, host, target) {
        let runners = this.getRunners(host, target);

        if (runners.length === 0) {
            return false;
        }

        if (runners.length < this.slotCount) {
            return false;
        }

        return runners.map(r => r.runner.isRunning(script, r.args))
            .filter(isRunning => isRunning === false).length !== 0;
    }

    /**
     * 
     * @param {string} host 
     * @param {string} target 
     * 
     * @returns {RunnerContainer[]}
     */
    getRunners(host, target) {
        if (!this.runners[`${host}`]) {
            return undefined;
        }

        if (!this.runners[`${host}`][`${target}`]) {
            return undefined;
        }

        return this.runners[`${host}`][`${target}`];
    }

     /**
     * 
     * @param {Zerver} server 
     * @param {string} target
     * @param {number} id 
     * @returns {string[]}
     */
    fingerprint(server, target, id = undefined) {
        switch(this.idGen) {
            case RunnerQueue.IdGenerator.Slots:
                return [target]; // todo
            case RunnerQueue.IdGenerator.Host:
                return [target, server.name];
            case RunnerQueue.IdGenerator.Provided:
                return [target, "" + id];
            case RunnerQueue.IdGenerator.None:
            default:
                return [target];
        }
    }
}