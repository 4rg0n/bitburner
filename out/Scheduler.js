/** @typedef {import(".").NS} NS */

import { WorkTicket } from "./WorkTicket.js";
import { Zerver } from "./Zerver.js";
import { Runner } from "./Runner.js";
import { Master } from "./Master.js";

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
     * @param {Scheduler[]} masters 
     * @param {string} workerType 
     */
    constructor(ns = {}, masters = [], workerType = Scheduler.WorkerType.All, homeMinRamFree = 0) {
        this.ns = ns;
        this.workerType = workerType;
        /** @type {Master[]} */
        this.masters = masters;
        /** @type {WorkTicket[]} */
        this.queue = [];
        /** @type {WorkTicket[]} */
        this.waiting = [];
        this.runners = {};
        this.scripts = {};
         /** @type {Zerver[]} */
        this.workers = [];
        this.homeMinRamFree = homeMinRamFree;
        this.homeRunning = false;
    }

    pollWork() {
        this.masters.forEach(master => {
            master.queue
                .filter(work => work.isNew())
                .forEach(work => {
                    work.setStatus(WorkTicket.Status.Initiating);
                    this.queue.push(work);
                });
        });

        this.queue.sort((a, b) => {
            const priority = a.priority - b.priority;
            return priority === 0 ? a.threads - b.threads : priority;
        })
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
            if (server.name == "home") {
                this.runners[`${server.name}|${target}`] = new Runner(this.ns, server.name, target, this.homeMinRamFree);
            } else {
                this.runners[`${server.name}|${target}`] = new Runner(this.ns, server.name, target);
            }
        }

        return this.runners[`${server.name}|${target}`];
    }

    /**
     * 
     * @returns {Zerver[]}
     */
    findServers() {
        const servers = Zerver.get(this.ns)
            .filter(server => {
                switch (this.workerType) {
                    case Scheduler.WorkerType.All:
                        return true;
                    case Scheduler.WorkerType.Own:
                        return server.type === Zerver.ServerType.Own;
                    default:
                    case Scheduler.WorkerType.NotHome:
                        return server.name !== 'home';
                }
            })
            .filter(server => server.hasRoot); 
        
        return servers;               
    }

    async cleanup() {
        if (typeof this.ns === "undefined") {
            return;
        }

        const servers = this.findServers();
        const promises = [];

        for (let i = 0; i < servers.length; i++) {
            const server = servers[i];

            for (let j = 0; j < this.masters.length; j++) {
                const master = this.masters[j];
                const runner = this.runner(server, master.target.name);
                promises.push(runner.kill(['hack.script', 'grow.script', 'weaken.script']));
            }
        }
        for (let i = 0; i < promises.length; i++)
            await promises[i];
    }

    async startWork() {
        const servers = this.findServers();
        
        for (let i = 0; i < servers.length; i++) {
            const server = servers[i];

            for (let j = 0; j < this.queue.length; j++) {
                const work = this.queue[j];
                if (work.status !== WorkTicket.Status.Initiating)
                    continue;

                const runner = this.runner(server, work.target.name);
                const maxThreads = server.threads(work.script);

                if (maxThreads < 1) break;
                if (runner.isRunning(work.script)) continue;

                const threads = Math.min(work.threads - work.progress, maxThreads);
                await runner.start(work.script, threads);

                this.saveScript(work, server.name, threads);
                work.progress += threads;

                if (work.progress >= work.threads) {
                    work.setStatus(WorkTicket.Status.Running);
                    this.waiting.push(work);
                }
            }
        }

        this.queue = this.queue.filter(work => work.progress < work.threads);
    }

    pushWork() {
        this.waiting.forEach(work => {
            this.findServers().forEach(server => {
                if (!this.runner(server, work.target.name).isRunning(work.script))
                    this.removeScript(work, server.name);
            })
        });

        this.waiting.filter(work => {
            const servers = this.findServers();

            if (servers.length === 0) return true;

            return servers.every(server => !this.runner(server, work.target.name).isRunning(work.script));
        }).forEach(work => {
            work.setStatus(WorkTicket.Status.Done);
        });

        this.waiting = this.waiting.filter(work => !work.isDone());
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

    async deployHacksToServers() {
        this.workers = this.findServers();

        for (const server of this.workers) {
            await this.deployHacks(server.name);
        }
    }

    /**
     * 
     * @param {string} host 
     */
    async deployHacks(host) {
        await this.ns.scp(Object.values(Zerver.Scripts), this.ns.getHostname(), host);
    }
}
