import { NS } from "@ns";
import { WorkTicket } from "dist/WorkTicket";
import { Zerver } from "server/Zerver";

/** @typedef {{hack: number, grow: number, weaken: number}} threads */

/**
 * Distributes hack / grow / weaken to a certain target
 */
export class WorkQueue {

    ns: NS
    target: Zerver
    taking: number
    status: string
    maxSize: number
    workQueue: WorkStack

    constructor(ns : NS, target : Zerver, taking = .5, maxSize = 10) {
        this.ns = ns;
        this.target = target;
        this.taking = isNaN(taking) ? .5 : Math.min(.9, Math.max(0, taking));
        this.status = WorkTicket.Status.Created;
        this.maxSize = maxSize;
        this.workQueue = new WorkStack([], this.maxSize);
    }

    addWork(script : string, threads : number, priority : number | undefined = undefined)  : void {
        if (threads < 1) return;

        const ramUsage = this.ns.getScriptRam(script) * threads;
        this.workQueue.push(new WorkTicket(this.target, threads, script, priority, ramUsage));
    }

    waitingForQueue() : boolean {
        if (this.workQueue.length === 0)
            return false;

        const result = !this.workQueue.tickets.every(work => work.isDone());
        if (!result) this.workQueue = new WorkStack([], this.maxSize);

        return result;
    }

    canBoost(boost = false) : boolean {
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

    queueWork(threads : {hack: number, grow: number, weaken: number}) : void{
        this.addWork(Zerver.Scripts.hack, threads.hack);
        this.addWork(Zerver.Scripts.grow, threads.grow);
        this.addWork(Zerver.Scripts.weaken, threads.weaken);
    }

    queueInitialize(boost = false) : void {
        if (this.waitingForQueue() && !this.canBoost(boost))
            return;

        const taking = (1 - (this.target.moneyAvail / this.target.moneyMax));
        
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

    queueAttack(taking : number) : void {
        if (this.waitingForQueue())
            return;
            
        const threads = this.target.analyzeAttackThreads(taking);
                
        this.addWork(Zerver.Scripts.hack, threads.hack);
        this.addWork(Zerver.Scripts.grow, threads.grow);
        this.addWork(Zerver.Scripts.weaken, threads.weaken);

        console.info(`Attack ${this.target.name} with hack: ${threads.hack}, grow: ${threads.grow}, weaken: ${threads.weaken}`);
    }

    queueShare(ramAvail : number, boost = false) : void {
        if (this.waitingForQueue() && !boost) {
            console.info(`Skipped queueing share for ${this.target.name}. Waiting for queue.`);
            return;
        }  

        const ramScript = this.ns.getScriptRam(Zerver.Scripts.share);
        const threads = Math.floor(ramAvail / ramScript);

        this.addWork(Zerver.Scripts.share, threads);
    }

    queue(boost = false) : boolean {
        const canBoost = this.canBoost(boost);
        if (this.waitingForQueue() && !canBoost) {
            console.info(`Skipped queueing work for ${this.target.name}. Waiting for queue.`);
            return false;
        }   

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
                this.queueInitialize(boost);
                break;

            case WorkTicket.Status.Running:
                this.queueAttack(this.taking);
                break;
        }

        return true;
    }

    getRamUsage() : number {
        return this.workQueue.tickets.map(t => t.ramUsage).reduce((a, b) => a + b, 0); 
    }
}

export class WorkStack {

    tickets: WorkTicket[]
	maxSize: number

	constructor(tickets = [], maxSize = 0) {
        this.tickets = tickets;
		this.maxSize = maxSize;
	}

	push(ticket : WorkTicket) : void {
		if (this.tickets.length >= this.maxSize) {
			this.tickets.shift();
		}

		this.tickets.push(ticket);
	}

	pop() : WorkTicket | undefined {
		return this.tickets.pop();
	}

	first() : WorkTicket {
        return this.tickets[0];
    }

    last() : WorkTicket {
        return this.tickets[this.tickets.length - 1];
    }

    get length() : number {
        return this.tickets.length;
    }

    isFull() : boolean {
        return this.tickets.length === this.maxSize;
    }
}