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
     * @param {number} booster
     */
    constructor(ns, target, taking = .5, booster = 1) {
        this.ns = ns;
        this.target = target;
        this.taking = isNaN(taking) ? .5 : Math.min(.9, Math.max(0, taking));
        this.status = WorkTicket.Status.Created;
        /** @type {WorkTicket[]} */
        this.workQueue = [];
        this.booster = booster;
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
        this.addWork(Deployer.Scripts.hack, threads.hack);
        this.addWork(Deployer.Scripts.grow, threads.grow);
        this.addWork(Deployer.Scripts.weaken, threads.weaken);
    }

    queueInitialize() {
        if (this.waitingForQueue())
            return;

        let taking = (1 - (this.target.moneyAvail / this.target.moneyMax));
        
        const threads = this.target.analyzeInitThreads(taking, this.booster);
        const diff = Math.round((this.target.securityCurr - this.target.securityMin) / .05);

        console.log(`Init ${this.target.name} calculated threads for taking ${taking}`, threads);

        if (threads.grow > 0 || diff > 0) {
            this.addWork(Deployer.Scripts.weaken, diff, WorkTicket.Priority.grow);
            this.addWork(Deployer.Scripts.grow, threads.grow);
            this.addWork(Deployer.Scripts.weaken, threads.weaken);
        }
    }

    /**
     * 
     * @param {number} taking 
     */
    queueAttack(taking) {
        const threads = this.target.analyzeAttackThreads(taking);

        console.log(`Attack ${this.target.name} calculated threads`, threads);
                
        this.addWork(Deployer.Scripts.hack, threads.hack);
        this.addWork(Deployer.Scripts.grow, threads.grow);
        this.addWork(Deployer.Scripts.weaken, threads.weaken);
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