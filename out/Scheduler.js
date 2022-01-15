// @ts-check
/** @typedef {import(".").NS} NS */
import { WorkTicket } from "./WorkTicket.js";
import { Zerver } from "./Zerver.js";
import { Runner } from "./Runner.js";
import { WorkQueue } from "./WorkQueue.js";
import { Deployer } from "./Deployer.js";
import { Cracker } from "./Cracker.js";

/** @typedef {{total: number, hack: number, grow: number, weaken: number}} distribution */

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
     * @param {Zerver[]} servers 
     * @param {Zerver[]} workers 
     * @param {Deployer} deployer
     * @param {number} taking
     * @param {number} boostFactor
     * @param {number} homeMinRamFree  
     */
    constructor(ns, servers, workers, deployer = undefined, taking = .5, boostFactor = 1, homeMinRamFree = 0) {
        this.ns = ns;
        this.servers = servers;
        this.targets = [];
        this.workers = workers;
        this.deployer = deployer || new Deployer(ns, new Cracker(ns));

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
        this.boostFactor = boostFactor;
        this.homeMinRamFree = homeMinRamFree;
    }

    async init() {
        await this.deployer.deployHacksToServers(this.servers);
        this.targets = this.servers.filter(t => t.isTargetable);
        this.scheduledQueue = Scheduler.createWorkQueues(this.ns, this.targets, this.taking, this.boostFactor);
    }

    /**
     * 
     * @param {NS} ns 
     * @param {Zerver[]} targets 
     * @param {number} taking 
     * @param {number} boostFactor
     * 
     * @returns {WorkQueue[]}
     */
    static createWorkQueues(ns, targets, taking, boostFactor) {
        return targets.map(target => new WorkQueue(ns, target, taking, boostFactor));
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

    
    /**
     * 
     * @param {Zerver[]} servers 
     * @param {string[]} ranks 
     * @returns 
     */
     static filterByMoneyRanks(servers, ranks = []) {
        if (ranks.length === 0) {
            return servers;
        }

        let targets = [];

        for (const rank of ranks) {
            targets = targets.concat(servers.filter(t => t.moneyRank.toLowerCase() === rank.toLowerCase()))
        }

        return targets;
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
        if (typeof this.ns === "undefined") {
            return;
        }

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
                if (runner.isRunning(work.script)) {
                    console.log(`Script ${work.script} ${work.threads} still running on ${runner.targetHost} -> ${runner.defaultArgs}`);
                    continue;
                } 

                const threads = Math.min(work.threads - work.progress, maxThreads);
                await runner.start(work.script, threads);

                this.saveScript(work, server.name, threads);
                work.progress += threads;

                console.log(`Started ${work.script} ${work.progress}/${work.threads} on ${runner.targetHost} -> ${runner.defaultArgs}`);

                if (work.progress >= work.threads) {
                    work.setStatus(WorkTicket.Status.Running);
                    console.log(`Waiting for work done ${work.script} ${work.progress}/${work.threads} ${work.target.name}`);
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
                    console.log(`Polled work ${work.script} ${work.threads} ${work.target.name}`);
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
            console.log(`Done work ${work.script} ${work.progress}/${work.threads} ${work.target.name}`);
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

    async run() {
        this.pollWork();
        await this.startWork();
        this.pushWork();
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
     * @returns {distribution} working tickets waiting to be finished
     */
    distWaitingTickets() {
        const hack = this.waitingQueue.filter(work => work.script === Deployer.Scripts.hack).length;
        const grow = this.waitingQueue.filter(work => work.script === Deployer.Scripts.grow).length;
        const weaken = this.waitingQueue.filter(work => work.script === Deployer.Scripts.weaken).length;
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
     * @returns {distribution} working threads waiting to be finished
     */
    distWaitingThreads() {
        const hack = this.waitingQueue.filter(work => work.script === Deployer.Scripts.hack)
            .map(work => work.threads)
            .reduce((a, b) => a + b, 0);
        const grow = this.waitingQueue.filter(work => work.script === Deployer.Scripts.grow)
            .map(work => work.threads)
            .reduce((a, b) => a + b, 0);
        const weaken = this.waitingQueue.filter(work => work.script === Deployer.Scripts.weaken)
            .map(work => work.threads)
            .reduce((a, b) => a + b, 0);
        const total = this.waitingQueue.map(work => work.threads)
            .reduce((a, b) => a + b, 0);

        return {
            total: total,
            hack: hack,
            grow: grow,
            weaken: weaken
        }
    }

    distInitiatingThreads() {
        const hack = this.initQueue.filter(work => work.script === Deployer.Scripts.hack)
            .filter(work => work.isInitaiting())
            .map(work => work.progress)
            .reduce((a, b) => a + b, 0);
        const grow = this.initQueue.filter(work => work.script === Deployer.Scripts.grow)
            .filter(work => work.isInitaiting())
            .map(work => work.progress)
            .reduce((a, b) => a + b, 0);
        const weaken = this.initQueue.filter(work => work.script === Deployer.Scripts.weaken)
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

    distInitiatingTickets() {
        const hack = this.initQueue.filter(work => work.script === Deployer.Scripts.hack)
            .filter(work => work.isInitaiting()).length;
        const grow = this.initQueue.filter(work => work.script === Deployer.Scripts.grow)
            .filter(work => work.isInitaiting()).length
        const weaken = this.initQueue.filter(work => work.script === Deployer.Scripts.weaken)
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
     * @returns {distribution} scheduled tickets waiting for execution
     */
    distScheduledTickets() {
        const hack = this.scheduledQueue.flatMap(queue => queue.workQueue).filter(work => work.script === Deployer.Scripts.hack).length;    
        const grow = this.scheduledQueue.flatMap(queue => queue.workQueue).filter(work => work.script === Deployer.Scripts.grow).length;     
        const weaken = this.scheduledQueue.flatMap(queue => queue.workQueue).filter(work => work.script === Deployer.Scripts.weaken).length;  
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
     * @returns {distribution} scheduled threads waiting for execution
     */
    distScheduledThreads() {
        const hack = this.scheduledQueue.flatMap(queue => queue.workQueue)
            .filter(work => work.script === Deployer.Scripts.hack)
            .map(work => work.threads)
            .reduce((a, b) => a + b, 0);    
        const grow = this.scheduledQueue.flatMap(queue => queue.workQueue)
            .filter(work => work.script === Deployer.Scripts.grow)
            .map(work => work.threads)
            .reduce((a, b) => a + b, 0);    
        const weaken = this.scheduledQueue.flatMap(queue => queue.workQueue)
            .filter(work => work.script === Deployer.Scripts.weaken)
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

    totalSecurityRanks() {
        const low = this.workers.filter(server => server.securityRank === Zerver.SecurityRank.Low).length;
        const med = this.workers.filter(server => server.securityRank === Zerver.SecurityRank.Med).length;
        const high = this.workers.filter(server => server.securityRank === Zerver.SecurityRank.High).length;
        const highest = this.workers.filter(server => server.securityRank === Zerver.SecurityRank.Highest).length;
        const total = this.workers.length;
        
        return {
            total: total,
            low: low,
            med: med,
            high: high,
            highest: highest
        }
    }
}
