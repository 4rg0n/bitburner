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
    addWork(script, threads, priority = undefined) {
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
        //console.info(`Boosting work for ${this.target.name}.`);
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
        //console.info(`Init ${this.target.name} with grow: ${threads.grow}, weaken: ${threads.weaken}, security weaken: ${diff}`);
    }
    queueAttack(taking) {
        if (this.waitingForQueue())
            return;
        const threads = this.target.analyzeAttackThreads(taking);
        this.addWork(Zerver.Scripts.hack, threads.hack);
        this.addWork(Zerver.Scripts.grow, threads.grow);
        this.addWork(Zerver.Scripts.weaken, threads.weaken);
        //console.info(`Attack ${this.target.name} with hack: ${threads.hack}, grow: ${threads.grow}, weaken: ${threads.weaken}`);
    }
    queueShare(ramAvail) {
        const ramScript = this.ns.getScriptRam(Zerver.Scripts.share);
        const threads = Math.floor(ramAvail / ramScript);
        this.addWork(Zerver.Scripts.share, threads);
    }
    queue(boost = false) {
        const canBoost = this.canBoost(boost);
        if (this.waitingForQueue() && !canBoost) {
            //console.info(`Skipped queueing work for ${this.target.name}. Waiting for queue.`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV29ya1F1ZXVlLmpzIiwic291cmNlUm9vdCI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9zb3VyY2VzLyIsInNvdXJjZXMiOlsiZGlzdC9Xb3JrUXVldWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzdDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFdkMsc0VBQXNFO0FBRXRFOztHQUVHO0FBQ0gsTUFBTSxPQUFPLFNBQVM7SUFFbEIsRUFBRSxDQUFJO0lBQ04sTUFBTSxDQUFRO0lBQ2QsTUFBTSxDQUFRO0lBQ2QsTUFBTSxDQUFRO0lBQ2QsT0FBTyxDQUFRO0lBQ2YsU0FBUyxDQUFXO0lBRXBCLFlBQVksRUFBTyxFQUFFLE1BQWUsRUFBRSxNQUFNLEdBQUcsRUFBRSxFQUFFLE9BQU8sR0FBRyxFQUFFO1FBQzNELElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ2IsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNyRSxJQUFJLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxTQUFTLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNyRCxDQUFDO0lBRUQsT0FBTyxDQUFDLE1BQWUsRUFBRSxPQUFnQixFQUFFLFdBQWdDLFNBQVM7UUFDaEYsSUFBSSxPQUFPLEdBQUcs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SSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUNyQjtRQUVELElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFRCxHQUFHO1FBQ0YsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQzNCLENBQUM7SUFFRCxLQUFLO1FBQ0UsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFRCxJQUFJO1FBQ0EsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFFRCxJQUFJLE1BQU07UUFDTixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO0lBQy9CLENBQUM7SUFFRCxNQUFNO1FBQ0YsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sS0FBSyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQ2hELENBQUM7Q0FDSiJ9