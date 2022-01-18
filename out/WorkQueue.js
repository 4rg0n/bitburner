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
     * @param {number} maxSize 
     */
    constructor(ns, target, taking = .5, maxSize = 10) {
        this.ns = ns;
        this.target = target;
        this.taking = isNaN(taking) ? .5 : Math.min(.9, Math.max(0, taking));
        this.status = WorkTicket.Status.Created;
        this.maxSize = maxSize;
        this.workQueue = new WorkStack([], this.maxSize);
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

        const result = !this.workQueue.tickets.every(work => work.isDone());
        if (!result) this.workQueue = new WorkStack([], this.maxSize);

        return result;
    }

    canBoost(boost = false) {
        if (boost === false) {
            return false;
        }

        if (this.target.moneyRank === Zerver.MoneyRank.Lowest) {
            // do not boost lowest servers (maybe a bad idea?)
            return false;
        }


        console.info(`Boosting work for ${this.target.name}.`);
        return true;
    }

    /**
     * @param {threads} threads 
     */
    queueWork(threads) {
        this.addWork(Zerver.Scripts.hack, threads.hack);
        this.addWork(Zerver.Scripts.grow, threads.grow);
        this.addWork(Zerver.Scripts.weaken, threads.weaken);
    }

    queueInitialize(boost = false) {
        if (this.waitingForQueue() && !this.canBoost(boost))
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
        if (this.waitingForQueue())
            return;
            
        const threads = this.target.analyzeAttackThreads(taking);
                
        this.addWork(Zerver.Scripts.hack, threads.hack);
        this.addWork(Zerver.Scripts.grow, threads.grow);
        this.addWork(Zerver.Scripts.weaken, threads.weaken);

        console.info(`Attack ${this.target.name} with hack: ${threads.hack}, grow: ${threads.grow}, weaken: ${threads.weaken}`);
    }

    /**
     * @returns {boolean} whether any work was queued or not
     */
    queue(boost = false) {
        const canBoost = this.canBoost(boost);
        if (this.waitingForQueue() && !canBoost) {
            console.info(`Queueing work for ${this.target.name} skipped. Waiting for queue.`);
        }   

        const taking = this.taking;

        switch (this.status) {
            default:
                this.status = WorkTicket.Status.Initiating;
                break;
            case WorkTicket.Status.Initiating:
                // if (canBoost) {
                //     // do not boost running
                //     break;
                // }

                this.status = WorkTicket.Status.Running;
                break;
        }

        switch (this.status) {
            default:
            case WorkTicket.Status.Initiating:
                this.queueInitialize(boost);
                
                break;

            case WorkTicket.Status.Running:
                this.queueAttack(taking);
                break;
        }

        return true;
    }
}

export class WorkStack {
	/**
	 * @param {WorkTicket[]} tickets
	 * @param {number} maxSize
	 */
	constructor(tickets = [], maxSize = 0) {
        this.tickets = tickets;
		this.maxSize = maxSize;

	}

    /**
     * 
     * @param {WorkTicket} ticket 
     */
	push(ticket) {
		if (this.tickets.length >= this.maxSize) {
			this.tickets.shift();
		}

		this.tickets.push(ticket);
	}

    /**
     * 
     * @returns {WorkTicket}
     */
	pop() {
		return this.tickets.pop();
	}

	first() {
        return this.tickets[0];
    }

    last() {
        return this.tickets[this.tickets.length - 1];
    }

    get length() {
        return this.tickets.length;
    }

    isFull() {
        return this.tickets.length === this.maxSize;
    }

    [Symbol.iterator]() { return this.tickets }
}