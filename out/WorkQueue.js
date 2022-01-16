// @ts-check
/** @typedef {import(".").NS} NS */
import { Deployer } from "./Deployer.js";
import { WorkTicket } from "./WorkTicket.js";
import { Zerver } from "./Zerver.js";

/** @typedef {{hack: number, grow: number, weaken: number}} threads */

/**
 * Distributes hack / grow / weaken to a certain target
 */
export class WorkQueue {

    /**
     * 
     * @param {NS} ns 
     * @param {Zerver} target 
     * @param {number} taking 
     */
    constructor(ns, target, taking = .5) {
        this.ns = ns;
        this.target = target;
        this.taking = isNaN(taking) ? .5 : Math.min(.9, Math.max(0, taking));
        this.status = WorkTicket.Status.Created;
        /** @type {WorkTicket[]} */
        this.workQueue = [];
    }

    /**
     * 
     * @param {string} script 
     * @param {number} threads 
     * @param {number} priority
     */
    addWork(script, threads, priority = undefined) {
        if (threads < 1) return;
        this.workQueue.push(new WorkTicket(this.target, threads, script, priority));
    }

    /**
     * 
     * @returns {boolean}
     */
    waitingForQueue() {
        if (this.workQueue.length === 0)
            return false;

        const result = !this.workQueue.every(work => work.isDone());
        if (!result) this.workQueue = [];

        return result;
    }

    /**
     * @param {threads} threads 
     */
    queueWork(threads) {
        this.addWork(Zerver.Scripts.hack, threads.hack);
        this.addWork(Zerver.Scripts.grow, threads.grow);
        this.addWork(Zerver.Scripts.weaken, threads.weaken);
    }

    queueInitialize() {
        if (this.waitingForQueue())
            return;

        let taking = (1 - (this.target.moneyAvail / this.target.moneyMax));
        
        const threads = this.target.analyzeInitThreads(taking);
        const diff = Math.round((this.target.securityCurr - this.target.securityMin) / .1);

        if (threads.grow > 0) {
            this.addWork(Zerver.Scripts.grow, threads.grow);
            this.addWork(Zerver.Scripts.weaken, threads.weaken);
        }

        if (diff > 0) { 
            this.addWork(Zerver.Scripts.weaken, diff, WorkTicket.Priority.grow);
        }

        console.info(`Init ${this.target.name} with grow: ${threads.grow}, weaken: ${threads.weaken}, security weaken: ${diff}`);
    }

    /**
     * 
     * @param {number} taking 
     */
    queueAttack(taking) {
        const threads = this.target.analyzeAttackThreads(taking);

                
        this.addWork(Zerver.Scripts.hack, threads.hack);
        this.addWork(Zerver.Scripts.grow, threads.grow);
        this.addWork(Zerver.Scripts.weaken, threads.weaken);

        console.info(`Attack ${this.target.name} with hack: ${threads.hack}, grow: ${threads.grow}, weaken: ${threads.weaken}`);
    }

    /**
     * @returns {boolean} whether any work was queued or not
     */
    queue() {
        if (this.waitingForQueue())
            return false;

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
                this.queueInitialize();
                
                break;

            case WorkTicket.Status.Running:
                    this.queueAttack(taking);
                break;
        }

        return true;
    }
}