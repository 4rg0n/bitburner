import { WorkTicket } from "dist/WorkTicket";
import { Zerver } from "server/Zerver";
/** @typedef {{hack: number, grow: number, weaken: number}} threads */
/**
 * Distributes hack / grow / weaken to a certain target
 */
export class WorkQueue {
    ns;
    target;
    taking;
    status;
    maxSize;
    workQueue;
    constructor(ns, target, taking = .5, maxSize = 10) {
        this.ns = ns;
        this.target = target;
        this.taking = isNaN(taking) ? .5 : Math.min(.9, Math.max(0, taking));
        this.status = WorkTicket.Status.Created;
        this.maxSize = maxSize;
        this.workQueue = new WorkStack([], this.maxSize);
    }
    addWork(script, threads, priority) {
        if (threads < 1)
            return;
        const ramUsage = this.ns.getScriptRam(script) * threads;
        this.workQueue.push(new WorkTicket(this.target, threads, script, priority, ramUsage));
    }
    waitingForQueue() {
        if (this.workQueue.length === 0)
            return false;
        const result = !this.workQueue.tickets.every(work => work.isDone());
        if (!result)
            this.workQueue = new WorkStack([], this.maxSize);
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
    queueWork(threads) {
        this.addWork(Zerver.Scripts.hack, threads.hack);
        this.addWork(Zerver.Scripts.grow, threads.grow);
        this.addWork(Zerver.Scripts.weaken, threads.weaken);
    }
    queueInitialize(boost = false) {
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
    queueAttack(taking) {
        if (this.waitingForQueue())
            return;
        const threads = this.target.analyzeAttackThreads(taking);
        this.addWork(Zerver.Scripts.hack, threads.hack);
        this.addWork(Zerver.Scripts.grow, threads.grow);
        this.addWork(Zerver.Scripts.weaken, threads.weaken);
        console.info(`Attack ${this.target.name} with hack: ${threads.hack}, grow: ${threads.grow}, weaken: ${threads.weaken}`);
    }
    queueShare(ramAvail, boost = false) {
        if (ramAvail <= 0)
            return;
        if (this.waitingForQueue() && !boost) {
            console.info(`Skipped queueing share for ${this.target.name}. Waiting for queue.`);
            return;
        }
        const ramScript = this.ns.getScriptRam(Zerver.Scripts.share);
        const threads = Math.floor(ramAvail / ramScript);
        this.addWork(Zerver.Scripts.share, threads);
    }
    queue(boost = false) {
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
    getRamUsage() {
        return this.workQueue.tickets.map(t => t.ramUsage).reduce((a, b) => a + b, 0);
    }
}
export class WorkStack {
    tickets;
    maxSize;
    constructor(tickets = [], maxSize = 0) {
        this.tickets = tickets;
        this.maxSize = maxSize;
    }
    push(ticket) {
        if (this.tickets.length >= this.maxSize) {
            this.tickets.shift();
        }
        this.tickets.push(ticket);
    }
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
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV29ya1F1ZXVlLmpzIiwic291cmNlUm9vdCI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9zb3VyY2VzLyIsInNvdXJjZXMiOlsiZGlzdC9Xb3JrUXVldWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzdDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFdkMsc0VBQXNFO0FBRXRFOztHQUVHO0FBQ0gsTUFBTSxPQUFPLFNBQVM7SUFFbEIsRUFBRSxDQUFJO0lBQ04sTUFBTSxDQUFRO0lBQ2QsTUFBTSxDQUFRO0lBQ2QsTUFBTSxDQUFRO0lBQ2QsT0FBTyxDQUFRO0lBQ2YsU0FBUyxDQUFXO0lBRXBCLFlBQVksRUFBTyxFQUFFLE1BQWUsRUFBRSxNQUFNLEdBQUcsRUFBRSxFQUFFLE9BQU8sR0FBRyxFQUFFO1FBQzNELElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ2IsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNyRSxJQUFJLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxTQUFTLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNyRCxDQUFDO0lBRUQsT0FBTyxDQUFDLE1BQWUsRUFBRSxPQUFnQixFQUFFLFFBQWtCO1FBQ3pELElBQUksT0FBTyxHQUFHLENBQUM7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