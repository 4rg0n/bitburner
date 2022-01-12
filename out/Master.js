import { WorkTicket } from "./WorkTicket.js";
import { Zerver } from "./Zerver.js";

/** @typedef {import(".").NS} NS */

/**
 * Distributes hack / grow / weaken to a certain target
 */
export class Master {

    /**
     * 
     * @param {NS} ns 
     * @param {Zerver} target 
     * @param {number} taking 
     */
    constructor(ns, target, taking = .5) {
        this.ns = ns;
        this.target = Zerver.create(ns, target);
        this.taking = isNaN(taking) ? .5 : Math.min(.9, Math.max(0, taking));
        this.status = WorkTicket.Status.Created;
        /** @type {WorkTicket[]} */
        this.queue = [];
        this.threads = {};
    }

    /**
     * 
     * @param {string} script 
     * @param {number} threads 
     * @param {number} priority 
     */
    addWork(script, threads, priority = undefined) {
        if (threads < 1) return;
        this.queue.push(new WorkTicket(this.target, threads, script, priority));
    }

    waitingForQueue() {
        if (this.queue.length === 0)
            return false;

        const result = !this.queue.every(work => work.isDone());
        if (!result) this.queue = [];

        return result;
    }

    async run() {
        if (this.waitingForQueue())
            return;

        const target = this.target;
        const taking = this.taking;

        switch (this.status) {
            default:
                this.status = WorkTicket.Status.Initiating;
                break;
            case WorkTicket.Status.Initiating:
                this.status = WorkTicket.Status.Running;
                break;
        }

        switch (this.status) {
            default:
            case WorkTicket.Status.Initiating:
                this.threads = target.analyzeThreads(1 - (target.moneyAvail / target.moneyMax));
                const diff = Math.round((target.securityCurr - target.securityMin) / .05);

                if (this.threads.grow > 0 || diff > 0) {
                    this.addWork(Zerver.Scripts.weaken, diff, WorkTicket.Priority.grow);
                    this.addWork(Zerver.Scripts.grow, this.threads.grow);
                    this.addWork(Zerver.Scripts.weaken, this.threads.weaken);
                }
                break;

            case WorkTicket.Status.Running:
                this.threads = target.analyzeThreads(taking);
                
                this.addWork(Zerver.Scripts.hack, this.threads.hack);
                this.addWork(Zerver.Scripts.grow, this.threads.grow);
                this.addWork(Zerver.Scripts.weaken, this.threads.weaken);
                break;
        }
    }
}