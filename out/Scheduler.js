// @ts-check
/** @typedef {import(".").NS} NS */
import { WorkTicket } from "./WorkTicket.js";
import { Zerver } from "./Zerver.js";
import { Runner } from "./Runner.js";
import { WorkQueue } from "./WorkQueue.js";
import { Deployer } from "./Deployer.js";
import { Cracker } from "./Cracker.js";
import { NumberStack } from "./utils.js";

/** @typedef {{total: number, hack: number, grow: number, weaken: number}} threadDist */

/**
 * Schedules and controlls distribution of hack / grow / weaken to different targets
 */
export class Scheduler {

    static WorkerType = {
        All: "all",
        Own: "own",
        NotHome: "nothome"
    }

    /**
     * 
     * @param {NS} ns
     * @param {Zerver[]} targetPool 
     * @param {Deployer} deployer
     * @param {string} workerType
     * @param {number} taking
     * @param {boolean} doBoost
     * @param {number} homeMinRamFree  
     */
    constructor(ns, targetPool, deployer = undefined, workerType = Scheduler.WorkerType.All, taking = .5, doBoost = false, homeMinRamFree = 0) {
        this.ns = ns;
        this.targetPool = targetPool;
        this.workerType = workerType;
        this.deployer = deployer || new Deployer(ns, new Cracker(ns));

        /** @type {Zerver[]} */
        this.workers = [];
        /** @type {Zerver[]} */
        this.targets = [];

        /** @type {WorkQueue[]} */
        this.scheduledQueue = [];
        /** @type {WorkTicket[]} */
        this.initQueue = [];
        /** @type {WorkTicket[]} */
        this.waitingQueue = [];

        /** @type {Object.<string, Runner>} */
        this.runners = {};
        this.scripts = {};
        
        this.taking = taking;
        this.doBoost = doBoost;
        this.homeMinRamFree = homeMinRamFree;
        this.ramUsageHistory = new NumberStack([], 10);
    }

    /**
     * 
     * @param {NS} ns 
     * @param {Zerver[]} targets 
     * @param {number} taking 
     * 
     * @returns {WorkQueue[]}
     */
    static createWorkQueues(ns, targets, taking) {
        return targets.map(target => new WorkQueue(ns, target, taking));
    }

    /**
     * @param {Zerver[]} servers
     * @param {string} workerType
     * 
     * @returns {Zerver[]}
     */
    static filterByWorkType(servers, workerType) {
        return servers.filter(server => {
            switch (workerType) {
                case Scheduler.WorkerType.All:
                    return true;
                case Scheduler.WorkerType.Own:
                    return server.type === Zerver.ServerType.Own;
                default:
                case Scheduler.WorkerType.NotHome:
                    return !server.isHome;
            }
        })
        .filter(server => server.hasRoot); 
    }
    
    async init() {
        await this.cleanup();
        
        delete this.targets;
        delete this.workers;
        delete this.scheduledQueue;

        const servers = Zerver.get(this.ns);

        this.workers = Scheduler.filterByWorkType(servers, this.workerType);
        this.targets = this.targetPool.filter(t => t.isTargetable);
        this.scheduledQueue = Scheduler.createWorkQueues(this.ns, this.targets, this.taking);

        await this.deployer.deployHacksToServers(servers);
        await this.ns.sleep(100);
    }

    /**
     * @param {WorkTicket} ticket
     * @param {string} server
     * @param {number} threads
     */
    saveScript(ticket, server, threads) {
        if (!this.scripts[ticket.id])
            this.scripts[ticket.id] = {};
        this.scripts[ticket.id][server] = threads;
    }

    /**
     * @param {WorkTicket} ticket
     * @returns {number}
     */
    getScript(ticket) {
        return this.scripts[ticket.id];
    }

    /**
     * @param {WorkTicket} ticket
     * @param {string} server
     * @param server
     */
    removeScript(ticket, server) {
        delete this.scripts[ticket.id][server];
    }

    /**
     * 
     * @param {Zerver} server 
     * @param {string} target 
     * @returns {Runner}
     */
    runner(server, target) {
        if (!this.runners[`${server.name}|${target}`]) {
            if (server.isHome) {
                this.runners[`${server.name}|${target}`] = new Runner(this.ns, server.name, target, this.homeMinRamFree);
            } else {
                this.runners[`${server.name}|${target}`] = new Runner(this.ns, server.name, target);
            }
        }

        return this.runners[`${server.name}|${target}`];
    }

    async cleanup() {
        const servers =  this.workers;
        const promises = [];

        for (let i = 0; i < servers.length; i++) {
            const server = servers[i];

            for (let j = 0; j < this.scheduledQueue.length; j++) {
                const master = this.scheduledQueue[j];
                const runner = this.runner(server, master.target.name);
                promises.push(runner.kill(['hack.script', 'grow.script', 'weaken.script']));
            }
        }
        for (let i = 0; i < promises.length; i++)
            await promises[i];
    }

    async startWork() {
        const servers = this.workers;
        
        for (let i = 0; i < servers.length; i++) {
            const server = servers[i];

            for (let j = 0; j < this.initQueue.length; j++) {
                const work = this.initQueue[j];
                if (work.status !== WorkTicket.Status.Initiating)
                    continue;

                const runner = this.runner(server, work.target.name);
                const maxThreads = server.threads(work.script);

                if (maxThreads < 1) break;
                if (runner.isRunning(work.script) && (!this.doBoost && !this.canBoost())) {
                    console.info(`Script ${work.script} ${work.threads} still running on ${runner.targetHost} -> ${runner.defaultArgs}`);
                    continue;
                } 

                const threads = Math.min(work.threads - work.progress, maxThreads);
                await runner.start(work.script, threads);

                this.saveScript(work, server.name, threads);
                work.progress += threads;
                // update queue
                this.initQueue[j] = work;

                console.info(`Started ${work.script} ${work.progress}/${work.threads} on ${runner.targetHost} -> ${runner.defaultArgs}`);
                
                if (work.progress >= work.threads) {
                    work.setStatus(WorkTicket.Status.Running);
                    console.info(`Waiting for work done ${work.script} ${work.progress}/${work.threads} ${work.target.name}`);
                    this.waitingQueue.push(work);
                }
            }
        }

        this.initQueue = this.initQueue.filter(work => work.progress < work.threads);
    }

    pollWork() {
        this.scheduledQueue.forEach(works => {
            works.workQueue
                .filter(work => work.isNew())
                .forEach(work => {
                    console.info(`Polled work ${work.script} ${work.threads} ${work.target.name}`);
                    work.setStatus(WorkTicket.Status.Initiating);
                    this.initQueue.push(work);
                });
        });

        this.initQueue.sort((a, b) => {
            const priority = a.priority - b.priority;
            return priority === 0 ? a.threads - b.threads : priority;
        })
    }

    pushWork() {
        this.waitingQueue.forEach(work => {
            this.workers.forEach(server => {
                if (!this.runner(server, work.target.name).isRunning(work.script))
                    this.removeScript(work, server.name);
            })
        });

        this.waitingQueue.filter(work => {
            const servers =  this.workers;

            if (servers.length === 0) return true;

            return servers.every(server => !this.runner(server, work.target.name).isRunning(work.script));
        }).forEach(work => {
            console.info(`Done work ${work.script} ${work.progress}/${work.threads} ${work.target.name}`);
            work.setStatus(WorkTicket.Status.Done);
        });

        this.waitingQueue = this.waitingQueue.filter(work => !work.isDone());
    }

    /**
     * 
     * @param {WorkQueue[]} scheduledWorks 
     */
    queueWork(scheduledWorks = undefined) {
        let works = scheduledWorks || this.scheduledQueue;

        for (const work of works) {
            work.queue();
            work.queue();
        }
    }

    /**
     * 
     * @param {WorkTicket} ticket 
     * @returns {number}
     */
    getTicketProgress(ticket) {
        const tickets = this.getScript(ticket);
        if (!tickets) return ticket.threads;

        return Object.keys(tickets).map(k => tickets[k]).reduce((a, b) => a + b, 0);
    }

    recordRamUsage() {
        this.ramUsageHistory.push(this.totalWorkersRamUsed());
    }

    canBoost() {
        // not enough usages collected?
        if (!this.ramUsageHistory.isFull()) {
            return false;
        }

        const avgRamFreePercent = (this.totalWorkersRamMax() - this.ramUsageHistory.avg()) / this.totalWorkersRamMax();

        if (avgRamFreePercent < .1) {
            return false;
        }

        const currRamFreePercent = (this.totalWorkersRamMax() - this.ramUsageHistory.last()) / this.totalWorkersRamMax();

        if (currRamFreePercent < .1) {
            return false;
        }

        return true;
    }

    async run() {
        this.pollWork();
        await this.startWork();
        this.pushWork();
        this.recordRamUsage();
    }

    /**
     * 
     * @param {Zerver[]} servers 
     */
    async deployHacksToServers(servers = undefined) {
        servers = servers || this.scheduledQueue.map(workQueue => workQueue.target);

        await this.deployer.deployHacksToServers(servers);
    }

    /**
     * 
     * @returns {threadDist} working tickets waiting to be finished
     */
    distWaitingTickets() {
        const hack = this.waitingQueue.filter(work => work.script === Zerver.Scripts.hack).length;
        const grow = this.waitingQueue.filter(work => work.script === Zerver.Scripts.grow).length;
        const weaken = this.waitingQueue.filter(work => work.script === Zerver.Scripts.weaken).length;
        const total = this.waitingQueue.length;

        return {
            total: total,
            hack: hack,
            grow: grow,
            weaken: weaken
        }
    }

    /**
     * 
     * @returns {threadDist} working threads waiting to be finished
     */
    distWaitingThreads() {
        const hack = this.waitingQueue.filter(work => work.script === Zerver.Scripts.hack)
            .map(work => work.threads)
            .reduce((a, b) => a + b, 0);
        const grow = this.waitingQueue.filter(work => work.script === Zerver.Scripts.grow)
            .map(work => work.threads)
            .reduce((a, b) => a + b, 0);
        const weaken = this.waitingQueue.filter(work => work.script === Zerver.Scripts.weaken)
            .map(work => work.threads)
            .reduce((a, b) => a + b, 0);
        const total = hack + grow + weaken;

        return {
            total: total,
            hack: hack,
            grow: grow,
            weaken: weaken
        }
    }

    /**
     * 
     * @returns {threadDist} progress of inititiating threads
     */
    distInitiatingProgressThreads() {
        const hack = this.initQueue.filter(work => work.script === Zerver.Scripts.hack)
            .filter(work => work.isInitaiting())
            .map(work => work.progress)
            .reduce((a, b) => a + b, 0);
        const grow = this.initQueue.filter(work => work.script === Zerver.Scripts.grow)
            .filter(work => work.isInitaiting())
            .map(work => work.progress)
            .reduce((a, b) => a + b, 0);
        const weaken = this.initQueue.filter(work => work.script === Zerver.Scripts.weaken)
            .filter(work => work.isInitaiting())
            .map(work => work.progress)
            .reduce((a, b) => a + b, 0);
        const total = hack + grow + weaken;

        return {
            total: total,
            hack: hack,
            grow: grow,
            weaken: weaken
        }
    }

    /**
     * 
     * @returns {threadDist} total of inititiating threads needed
     */
    distInitiatingTotalThreads() {
        const hack = this.initQueue.filter(work => work.script === Zerver.Scripts.hack)
            .filter(work => work.isInitaiting())
            .map(work => work.threads)
            .reduce((a, b) => a + b, 0);
        const grow = this.initQueue.filter(work => work.script === Zerver.Scripts.grow)
            .filter(work => work.isInitaiting())
            .map(work => work.threads)
            .reduce((a, b) => a + b, 0);
        const weaken = this.initQueue.filter(work => work.script === Zerver.Scripts.weaken)
            .filter(work => work.isInitaiting())
            .map(work => work.threads)
            .reduce((a, b) => a + b, 0);
        const total = hack + grow + weaken;

        return {
            total: total,
            hack: hack,
            grow: grow,
            weaken: weaken
        }
    }

    distInitiatingTickets() {
        const hack = this.initQueue.filter(work => work.script === Zerver.Scripts.hack)
            .filter(work => work.isInitaiting()).length;
        const grow = this.initQueue.filter(work => work.script === Zerver.Scripts.grow)
            .filter(work => work.isInitaiting()).length
        const weaken = this.initQueue.filter(work => work.script === Zerver.Scripts.weaken)
            .filter(work => work.isInitaiting()).length
        const total = hack + grow + weaken;

        return {
            total: total,
            hack: hack,
            grow: grow,
            weaken: weaken
        }    
    }
    /**
     * 
     * @returns {threadDist} scheduled tickets waiting for execution
     */
    distScheduledTickets() {
        const hack = this.scheduledQueue.flatMap(queue => queue.workQueue).filter(work => work.script === Zerver.Scripts.hack).length;    
        const grow = this.scheduledQueue.flatMap(queue => queue.workQueue).filter(work => work.script === Zerver.Scripts.grow).length;     
        const weaken = this.scheduledQueue.flatMap(queue => queue.workQueue).filter(work => work.script === Zerver.Scripts.weaken).length;  
        const total = hack + grow + weaken;

        return {
            total: total,
            hack: hack,
            grow: grow,
            weaken: weaken
        }
    }

    /**
     * 
     * @returns {threadDist} scheduled threads waiting for execution
     */
    distScheduledThreads() {
        const hack = this.scheduledQueue.flatMap(queue => queue.workQueue)
            .filter(work => work.script === Zerver.Scripts.hack)
            .map(work => work.threads)
            .reduce((a, b) => a + b, 0);    
        const grow = this.scheduledQueue.flatMap(queue => queue.workQueue)
            .filter(work => work.script === Zerver.Scripts.grow)
            .map(work => work.threads)
            .reduce((a, b) => a + b, 0);    
        const weaken = this.scheduledQueue.flatMap(queue => queue.workQueue)
            .filter(work => work.script === Zerver.Scripts.weaken)
            .map(work => work.threads)
            .reduce((a, b) => a + b, 0); 
        const total = hack + grow + weaken;

        return {
            total: total,
            hack: hack,
            grow: grow,
            weaken: weaken
        }
    }

    distSecurityRanks() {
        const low = this.targets.filter(server => server.securityRank === Zerver.SecurityRank.Low).length;
        const med = this.targets.filter(server => server.securityRank === Zerver.SecurityRank.Med).length;
        const high = this.targets.filter(server => server.securityRank === Zerver.SecurityRank.High).length;
        const highest = this.targets.filter(server => server.securityRank === Zerver.SecurityRank.Highest).length;
        const total = this.targets.length;
        
        return {
            total: total,
            low: low,
            med: med,
            high: high,
            highest: highest
        }
    }

    /**
     * @returns {number}
     */
    totalWorkersRamUsed() {
        return this.workers.map(worker => worker.ramUsed).reduce((a, b) => a + b, 0);
    }

    /**
     * @returns {number}
     */
    totalWorkersRamMax() {
        return this.workers.map(worker => worker.ramMax).reduce((a, b) => a + b, 0);
    }

    /**
     * @returns {number}
     */
    totalTargetsInitiating() {
        return this.scheduledQueue.filter(master => master.status === WorkTicket.Status.Initiating).length;
    }

    /**
     * @returns {number}
     */
    totalTargetsRunning() {
        return this.scheduledQueue.filter(master => master.status === WorkTicket.Status.Running).length;
    }

    /**
     * @returns {number}
     */
    totalTargetsMoneyMax() {
        return this.scheduledQueue.map(master => master.target.moneyMax).reduce((a, b) => a + b, 0); 
    }

    /**
     * @returns {number}
     */
    totalTargetsMoneyAvail() {
        return this.scheduledQueue.map(master => master.target.moneyAvail).reduce((a, b) => a + b, 0);
    }
}
