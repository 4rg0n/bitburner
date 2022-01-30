import { NS } from "@ns";
import { WorkTicket } from "dist/WorkTicket";
import { Zerver } from "server/Zerver";
import { Runner } from "dist/Runner";
import { WorkQueue } from "dist/WorkQueue";
import { Deployer } from "dist/Deployer";
import { Cracker } from "dist/Cracker";
import { NumberStack } from "lib/utils";

/**
 * Schedules and controlls distribution of hack / grow / weaken to different targets
 */
export class Scheduler {

    static WorkerType = {
        All: "all",
        Own: "own",
        NotHome: "nothome",
        Home: "home"
    }

   ns: NS
   targetPool: Zerver[]
   workerType: string
   deployer: Deployer
   workers: Zerver[] = []
   targets: Zerver[] =  []

   scheduledQueue: WorkQueue[] = []
   initQueue: WorkTicket[] = []
   waitingQueue: WorkTicket[] = []

   runners: {[key: string]: Runner} = {}
   scripts: {[key: number]: {[key: string]: number}} = {}
   
   taking: number
   doShare: boolean
   doBoost: boolean
   doAggro: boolean
   homeMinRamFree: number
   ramUsageHistory: NumberStack

     constructor(ns : NS, targetPool : Zerver[], deployer : Deployer | undefined = undefined, workerType = Scheduler.WorkerType.All, taking = .5, doShare = false, doBoost = false, doAggro = false, homeMinRamFree = 0) {
        this.ns = ns;
        this.targetPool = targetPool;
        this.workerType = workerType;
        this.deployer = deployer || new Deployer(ns, new Cracker(ns));

        this.taking = taking;
        this.doShare = doShare;
        this.doBoost = doBoost;
        this.doAggro = doAggro;
        this.homeMinRamFree = homeMinRamFree;
        this.ramUsageHistory = new NumberStack([], 10);
    }

    static createWorkQueues(ns : NS, targets : Zerver[], taking : number | undefined = undefined) : WorkQueue[] {
        return targets.map(target => new WorkQueue(ns, target, taking));
    }

    static filterByWorkType(servers : Zerver[], workerType : string) : Zerver[] {
        return servers.filter(server => {
            switch (workerType) {
                case Scheduler.WorkerType.All:
                    return true;
                case Scheduler.WorkerType.Own:
                    return server.type === Zerver.ServerType.Own;
                default:
                case Scheduler.WorkerType.NotHome:
                    return !server.isHome;
                case Scheduler.WorkerType.Home:
                    return server.isHome; 
            }
        })
        .filter(server => server.hasRoot); 
    }
    
    async init(): Promise<void> {
        await this.cleanup();
        
        this.targets = [];
        this.workers = [];
        this.scheduledQueue = [];

        const servers = Zerver.get(this.ns);
        this.workers = Scheduler.filterByWorkType(servers, this.workerType);

        this.targets = this.targetPool.filter(t => t.isTargetable);
        this.scheduledQueue = Scheduler.createWorkQueues(this.ns, this.targets, this.taking);

        await this.deployer.deployScriptsToServers(servers);
        await this.ns.sleep(100);
    }

    saveScript(ticket : WorkTicket, host : string, threads : number) : void {
        if (!this.scripts[ticket.id])
            this.scripts[ticket.id] = {};
        this.scripts[ticket.id][host] = threads;
    }

    getScript(ticket : WorkTicket) : {[key: string]: number} {
        return this.scripts[ticket.id];
    }

    removeScript(ticket : WorkTicket, host : string) : void{
        delete this.scripts[ticket.id][host];
    }

    runner(server : Zerver, target : string, id : number | string | undefined = undefined) : Runner {
        let args;

        // add an id to each runner: will result in spawning more scripts
        if (this.doAggro) {
            args = (id) ? [target, "" + id]  : [target];
        } else {
            args = [target];
        }

        if (!this.runners[`${server.name}|${args}`]) {
            if (server.isHome) {
                this.runners[`${server.name}|${args}`] = new Runner(this.ns, server.name, args, this.homeMinRamFree);
            } else {
                this.runners[`${server.name}|${args}`] = new Runner(this.ns, server.name, args);
            }
        }

        return this.runners[`${server.name}|${args}`];
    }

    async cleanup(): Promise<void> {
        const servers =  this.workers;
        const promises = [];

        for (let i = 0; i < servers.length; i++) {
            const server = servers[i];

            for (let j = 0; j < this.scheduledQueue.length; j++) {
                const master = this.scheduledQueue[j];
                const runner = this.runner(server, master.target.name);
                promises.push(runner.kill(Object.values(Zerver.Scripts)));
            }
        }
        for (let i = 0; i < promises.length; i++)
            await promises[i];
    }

    async startWork(): Promise<void> {
        const servers = this.workers;
        
        for (let i = 0; i < servers.length; i++) {
            const server = servers[i];

            for (let j = 0; j < this.initQueue.length; j++) {
                const work = this.initQueue[j];
                if (work.status !== WorkTicket.Status.Initiating)
                    continue;

                const runner = this.runner(server, work.target.name, work.id);
                const maxThreads = server.threads(work.script);

                if (maxThreads < 1) break;
                if (runner.isRunning(work.script)) {
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

            if (this.canBoost()) await this.ns.sleep(10);
        }

        this.initQueue = this.initQueue.filter(work => work.progress < work.threads);
    }

    pollWork(): void {
        this.scheduledQueue.forEach(works => {
            works.workQueue.tickets
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

    pushWork(): void {
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

    queueWork(scheduledWorks : WorkQueue[] | undefined = undefined): void {
        const works = scheduledWorks || this.scheduledQueue;

        for (const work of works) {
            work.queue(this.canBoost());
        }

        if (!this.doShare) return;

        const ramUsage = works.map(w => w.getRamUsage()).reduce((a, b) => a + b, 0);
        const ramAvail = this.totalWorkersRamMax() - ramUsage;

        for (const work of works) {
            if (work.workQueue.isFull() || work.status !== WorkTicket.Status.Running) continue;
            work.queueShare(ramAvail)
        }
    }

    getTicketProgress(ticket : WorkTicket) : number {
        const tickets = this.getScript(ticket);
        if (!tickets) return ticket.threads;

        return Object.keys(tickets).map(k => tickets[k]).reduce((a, b) => a + b, 0);
    }

    recordRamUsage(): void {
        this.ramUsageHistory.push(this.totalWorkersRamUsed());
    }

    canBoost(): boolean {
        if (!this.doBoost) {
            return false;
        }

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

    async run(): Promise<void> {
        this.pollWork();
        await this.startWork();
        this.pushWork();
        this.recordRamUsage();
    }

    /**
     * 
     * @param {Zerver[]} servers 
     */
    async deployHacksToServers(servers : Zerver[] | undefined = undefined): Promise<void> {
        servers = servers || this.scheduledQueue.map(workQueue => workQueue.target);

        await this.deployer.deployScriptsToServers(servers);
    }

    distWaitingTickets() : { total: number; hack: number; grow: number; weaken: number; share: number; } {
        const hack = this.waitingQueue.filter(work => work.script === Zerver.Scripts.hack).length;
        const grow = this.waitingQueue.filter(work => work.script === Zerver.Scripts.grow).length;
        const weaken = this.waitingQueue.filter(work => work.script === Zerver.Scripts.weaken).length;
        const share = this.waitingQueue.filter(work => work.script === Zerver.Scripts.share).length;
        const total = this.waitingQueue.length;

        return {
            total: total,
            hack: hack,
            grow: grow,
            weaken: weaken,
            share: share
        }
    }

    distWaitingThreads() : { total: number; hack: number; grow: number; weaken: number; share: number; } {
        const hack = this.waitingQueue.filter(work => work.script === Zerver.Scripts.hack)
            .map(work => work.threads)
            .reduce((a, b) => a + b, 0);
        const grow = this.waitingQueue.filter(work => work.script === Zerver.Scripts.grow)
            .map(work => work.threads)
            .reduce((a, b) => a + b, 0);
        const weaken = this.waitingQueue.filter(work => work.script === Zerver.Scripts.weaken)
            .map(work => work.threads)
            .reduce((a, b) => a + b, 0);
        const share = this.waitingQueue.filter(work => work.script === Zerver.Scripts.share)
            .map(work => work.threads)
            .reduce((a, b) => a + b, 0);    
        const total = +hack + +grow + +weaken + +share;

        return {
            total: total,
            hack: hack,
            grow: grow,
            weaken: weaken,
            share: share
        }
    }

    distInitiatingProgressThreads() : { total: number; hack: number; grow: number; weaken: number; share: number; } {
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
        const share = this.initQueue.filter(work => work.script === Zerver.Scripts.share)
            .filter(work => work.isInitaiting())
            .map(work => work.progress)
            .reduce((a, b) => a + b, 0);    
        const total = +hack + +grow + +weaken + +share;

        return {
            total: total,
            hack: hack,
            grow: grow,
            weaken: weaken,
            share: share
        }
    }

    distInitiatingTotalThreads() : { total: number; hack: number; grow: number; weaken: number; share: number; } {
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
        const share = this.initQueue.filter(work => work.script === Zerver.Scripts.share)
            .filter(work => work.isInitaiting())
            .map(work => work.threads)
            .reduce((a, b) => a + b, 0);    
        const total = +hack + +grow + +weaken + +share;

        return {
            total: total,
            hack: hack,
            grow: grow,
            weaken: weaken,
            share: share
        }
    }

    distInitiatingTickets() : { total: number; hack: number; grow: number; weaken: number; share: number; } {
        const hack = this.initQueue.filter(work => work.script === Zerver.Scripts.hack)
            .filter(work => work.isInitaiting()).length;
        const grow = this.initQueue.filter(work => work.script === Zerver.Scripts.grow)
            .filter(work => work.isInitaiting()).length;
        const weaken = this.initQueue.filter(work => work.script === Zerver.Scripts.weaken)
            .filter(work => work.isInitaiting()).length;
        const share = this.initQueue.filter(work => work.script === Zerver.Scripts.share)
            .filter(work => work.isInitaiting()).length;    
        const total = +hack + +grow + +weaken + +share;

        return {
            total: total,
            hack: hack,
            grow: grow,
            weaken: weaken,
            share: share
        }    
    }

    distScheduledTickets() : { total: number; hack: number; grow: number; weaken: number; share: number; } {
        const hack = this.scheduledQueue.flatMap(queue => queue.workQueue.tickets).filter(work => work.script === Zerver.Scripts.hack).length;    
        const grow = this.scheduledQueue.flatMap(queue => queue.workQueue.tickets).filter(work => work.script === Zerver.Scripts.grow).length;     
        const weaken = this.scheduledQueue.flatMap(queue => queue.workQueue.tickets).filter(work => work.script === Zerver.Scripts.weaken).length;  
        const share = this.scheduledQueue.flatMap(queue => queue.workQueue.tickets).filter(work => work.script === Zerver.Scripts.share).length;  
        const total = +hack + +grow + +weaken + +share;

        return {
            total: total,
            hack: hack,
            grow: grow,
            weaken: weaken,
            share: share
        }
    }

    distScheduledThreads(): { total: number; hack: number; grow: number; weaken: number; share: number; } {
        const hack = this.scheduledQueue.flatMap(queue => queue.workQueue.tickets)
            .filter(work => work.script === Zerver.Scripts.hack)
            .map(work => work.threads)
            .reduce((a, b) => a + b, 0);    
        const grow = this.scheduledQueue.flatMap(queue => queue.workQueue.tickets)
            .filter(work => work.script === Zerver.Scripts.grow)
            .map(work => work.threads)
            .reduce((a, b) => a + b, 0);    
        const weaken = this.scheduledQueue.flatMap(queue => queue.workQueue.tickets)
            .filter(work => work.script === Zerver.Scripts.weaken)
            .map(work => work.threads)
            .reduce((a, b) => a + b, 0);
        const share = this.scheduledQueue.flatMap(queue => queue.workQueue.tickets)
            .filter(work => work.script === Zerver.Scripts.share)
            .map(work => work.threads)
            .reduce((a, b) => a + b, 0);     
        const total = +hack + +grow + +weaken + +share;

        return {
            total: total,
            hack: hack,
            grow: grow,
            weaken: weaken,
            share: share
        }
    }

    distSecurityRanks(): { total: number; low: number; med: number; high: number; highest: number; } {
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

    totalWorkersRamUsed() : number {
        return this.workers.map(worker => worker.ramUsed).reduce((a, b) => a + b, 0);
    }

    totalWorkersRamMax() : number {
        return this.workers.map(worker => worker.ramMax).reduce((a, b) => a + b, 0);
    }

    totalTargetsInitiating() : number {
        return this.scheduledQueue.filter(master => master.status === WorkTicket.Status.Initiating).length;
    }

    totalTargetsRunning() : number {
        return this.scheduledQueue.filter(master => master.status === WorkTicket.Status.Running).length;
    }

    totalTargetsMoneyMax() : number {
        return this.scheduledQueue.map(master => master.target.moneyMax).reduce((a, b) => a + b, 0); 
    }

    totalTargetsMoneyAvail() : number {
        return this.scheduledQueue.map(master => master.target.moneyAvail).reduce((a, b) => a + b, 0);
    }
}
