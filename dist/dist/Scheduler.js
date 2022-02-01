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
    };
    ns;
    targetPool;
    workerType;
    deployer;
    workers = [];
    targets = [];
    scheduledQueue = [];
    initQueue = [];
    waitingQueue = [];
    runners = {};
    scripts = {};
    taking;
    doShare;
    doBoost;
    doAggro;
    homeMinRamFree;
    ramCap;
    ramMap;
    ramUsageHistory;
    constructor(ns, targetPool, deployer = undefined, workerType = Scheduler.WorkerType.All, taking = .5, doShare = false, doBoost = false, doAggro = false, homeMinRamFree = 0, ramCap = 0) {
        this.ns = ns;
        this.targetPool = targetPool;
        this.workerType = workerType;
        this.deployer = deployer || new Deployer(ns, new Cracker(ns));
        this.taking = taking;
        this.doShare = doShare;
        this.doBoost = doBoost;
        this.doAggro = doAggro;
        this.homeMinRamFree = homeMinRamFree;
        this.ramCap = ramCap;
        this.ramMap = {};
        this.ramUsageHistory = new NumberStack([], 10);
    }
    static createWorkQueues(ns, targets, taking = undefined) {
        return targets.map(target => new WorkQueue(ns, target, taking));
    }
    /**
     * For knowing how much ram is available on each server when there is a overall ram capacity
     */
    static createRamMap(servers, ramCap = 0, homeMinRamFree = 0) {
        const ramMap = {};
        if (servers.length === 0)
            return ramMap;
        // lowest ram first
        servers = servers.sort((a, b) => a.ramMax - b.ramMax);
        let ramAvail = ramCap;
        for (const server of servers) {
            const serverRamMax = server.ramMax;
            const name = server.name;
            if (ramAvail <= 0) {
                ramMap[name] = 0;
            }
            else if (ramAvail >= serverRamMax) {
                ramMap[name] = serverRamMax;
                ramAvail = ramAvail - serverRamMax;
            }
            else {
                ramMap[name] = ramAvail;
                ramAvail = ramAvail - ramAvail;
            }
        }
        if (typeof ramMap[Zerver.Home] !== "undefined") {
            ramMap[Zerver.Home] = ramMap[Zerver.Home] - homeMinRamFree;
        }
        return ramMap;
    }
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
                case Scheduler.WorkerType.Home:
                    return server.isHome;
            }
        })
            .filter(server => server.isWorkable);
    }
    /**
     * Needs to be executed first to make the Scheduler do it's work
     */
    async init() {
        await this.cleanup();
        this.targets = [];
        this.workers = [];
        this.scheduledQueue = [];
        const servers = Zerver.get(this.ns);
        this.workers = Scheduler.filterByWorkType(servers, this.workerType);
        this.ramMap = Scheduler.createRamMap(this.workers, this.getTotalRamCapacity(), this.homeMinRamFree);
        this.targets = this.targetPool.filter(t => t.isTargetable);
        this.scheduledQueue = Scheduler.createWorkQueues(this.ns, this.targets, this.taking);
        await this.deployer.deployScriptsToServers(servers);
        await this.ns.sleep(100);
    }
    saveScript(ticket, host, threads) {
        if (!this.scripts[ticket.id])
            this.scripts[ticket.id] = {};
        this.scripts[ticket.id][host] = threads;
    }
    getScript(ticket) {
        return this.scripts[ticket.id];
    }
    removeScript(ticket, host) {
        delete this.scripts[ticket.id][host];
    }
    /**
     * Creates runners for scripts execution
     */
    runner(server, target, id = undefined) {
        let args;
        // add an id to each runner: will result in spawning more scripts
        if (this.doAggro) {
            args = (id) ? [target, "" + id] : [target];
        }
        else {
            args = [target];
        }
        if (!this.runners[`${server.name}|${args}`]) {
            const ramCap = this.ramMap[server.name];
            this.runners[`${server.name}|${args}`] = new Runner(this.ns, server.name, args, ramCap);
        }
        return this.runners[`${server.name}|${args}`];
    }
    /**
     * Kill all running scripts
     */
    async cleanup() {
        const servers = this.workers;
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
    /**
     * Execute scripts
     */
    async startWork() {
        const servers = this.workers;
        for (let i = 0; i < servers.length; i++) {
            const server = servers[i];
            for (let j = 0; j < this.initQueue.length; j++) {
                const work = this.initQueue[j];
                if (work.status !== WorkTicket.Status.Initiating)
                    continue;
                const runner = this.runner(server, work.target.name, work.id);
                const maxThreads = server.threads(work.script);
                if (maxThreads < 1)
                    break;
                if (runner.isRunning(work.script)) {
                    //console.info(`Script ${work.script} ${work.threads} still running on ${runner.targetHost} -> ${runner.defaultArgs}`);
                    continue;
                }
                const threads = Math.min(work.threads - work.progress, maxThreads);
                await runner.start(work.script, threads);
                this.saveScript(work, server.name, threads);
                work.progress += threads;
                // update queue
                this.initQueue[j] = work;
                //console.info(`Started ${work.script} ${work.progress}/${work.threads} on ${runner.targetHost} -> ${runner.defaultArgs}`);
                if (work.progress >= work.threads) {
                    work.setStatus(WorkTicket.Status.Running);
                    //console.info(`Waiting for work done ${work.script} ${work.progress}/${work.threads} ${work.target.name}`);
                    this.waitingQueue.push(work);
                }
            }
            if (this.canBoost())
                await this.ns.sleep(10);
        }
        this.initQueue = this.initQueue.filter(work => work.progress < work.threads);
    }
    /**
     * Move scheduled work into initialisation
     */
    pollWork() {
        this.scheduledQueue.forEach(works => {
            works.workQueue.tickets
                .filter(work => work.isNew())
                .forEach(work => {
                //console.info(`Polled work ${work.script} ${work.threads} ${work.target.name}`);
                work.setStatus(WorkTicket.Status.Initiating);
                this.initQueue.push(work);
            });
        });
        this.initQueue.sort((a, b) => {
            const priority = a.priority - b.priority;
            return priority === 0 ? a.threads - b.threads : priority;
        });
    }
    /**
     * Removes work when it's done
     */
    pushWork() {
        this.waitingQueue.forEach(work => {
            this.workers.forEach(server => {
                if (!this.runner(server, work.target.name).isRunning(work.script))
                    this.removeScript(work, server.name);
            });
        });
        this.waitingQueue.filter(work => {
            const servers = this.workers;
            if (servers.length === 0)
                return true;
            return servers.every(server => !this.runner(server, work.target.name).isRunning(work.script));
        }).forEach(work => {
            //console.info(`Done work ${work.script} ${work.progress}/${work.threads} ${work.target.name}`);
            work.setStatus(WorkTicket.Status.Done);
        });
        this.waitingQueue = this.waitingQueue.filter(work => !work.isDone());
    }
    /**
     * Creates new work tickets
     */
    scheduleWork(scheduledWorks = undefined) {
        const works = scheduledWorks || this.scheduledQueue;
        for (const work of works) {
            work.queue(this.canBoost());
        }
        if (!this.canShare())
            return;
        const ramAvail = this.getTotalRamAvail(this.totalWorkersRamMax());
        if (ramAvail <= 0)
            return;
        for (const work of works) {
            if (work.workQueue.isFull() || work.status !== WorkTicket.Status.Running)
                continue;
            work.queueShare(ramAvail);
        }
    }
    getTicketProgress(ticket) {
        const tickets = this.getScript(ticket);
        if (!tickets)
            return ticket.threads;
        return Object.keys(tickets).map(k => tickets[k]).reduce((a, b) => a + b, 0);
    }
    recordRamUsage() {
        this.ramUsageHistory.push(this.totalWorkersRamUsed());
    }
    /**
     * todo this could interfer with boost :x
     */
    canShare() {
        if (!this.doShare) {
            return false;
        }
        return this.isEnoughRamFree(0.1, this.totalWorkersRamMax());
    }
    /**
     * Will allow scheduling of more work when there's enough ram
     */
    canBoost() {
        if (!this.doBoost) {
            return false;
        }
        return this.isEnoughRamFree();
    }
    getSharePower() {
        return this.ns.getSharePower();
    }
    isEnoughRamFree(minPercent = 0.1, ramCap = this.getTotalRamCapacity()) {
        // not enough usages collected?
        if (!this.ramUsageHistory.isFull()) {
            return false;
        }
        const avgRamFreePercent = (ramCap - this.ramUsageHistory.avg()) / ramCap;
        if (avgRamFreePercent < minPercent) {
            return false;
        }
        const currRamFreePercent = (ramCap - this.ramUsageHistory.last()) / ramCap;
        if (currRamFreePercent < minPercent) {
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
    async deployHacksToServers(servers = undefined) {
        servers = servers || this.scheduledQueue.map(workQueue => workQueue.target);
        await this.deployer.deployScriptsToServers(servers);
    }
    getTotalRamCapacity() {
        const totalRamMax = this.totalWorkersRamMax();
        if (this.ramCap !== 0 && this.ramCap < totalRamMax) {
            return this.ramCap;
        }
        return totalRamMax;
    }
    getTotalRamAvail(capacity = undefined) {
        if (typeof capacity === "undefined") {
            capacity = this.getTotalRamCapacity();
        }
        const ramUsage = this.scheduledQueue.map(w => w.getRamUsage()).reduce((a, b) => a + b, 0);
        const ramAvail = capacity - ramUsage;
        if (ramAvail < 0) {
            return 0;
        }
        return ramAvail;
    }
    distWaitingTickets() {
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
        };
    }
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
        };
    }
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
        };
    }
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
        };
    }
    distInitiatingTickets() {
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
        };
    }
    distScheduledTickets() {
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
        };
    }
    distScheduledThreads() {
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
        };
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
        };
    }
    totalWorkersRamUsed() {
        return this.workers.map(worker => worker.ramUsed).reduce((a, b) => a + b, 0);
    }
    totalWorkersRamMax() {
        return this.workers.map(worker => worker.ramMax).reduce((a, b) => a + b, 0);
    }
    totalTargetsInitiating() {
        return this.scheduledQueue.filter(master => master.status === WorkTicket.Status.Initiating).length;
    }
    totalTargetsRunning() {
        return this.scheduledQueue.filter(master => master.status === WorkTicket.Status.Running).length;
    }
    totalTargetsMoneyMax() {
        return this.scheduledQueue.map(master => master.target.moneyMax).reduce((a, b) => a + b, 0);
    }
    totalTargetsMoneyAvail() {
        return this.scheduledQueue.map(master => master.target.moneyAvail).reduce((a, b) => a + b, 0);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NoZWR1bGVyLmpzIiwic291cmNlUm9vdCI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9zb3VyY2VzLyIsInNvdXJjZXMiOlsiZGlzdC9TY2hlZHVsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzdDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDdkMsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUNyQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDM0MsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQ3ZDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFFeEM7O0dBRUc7QUFDSCxNQUFNLE9BQU8sU0FBUztJQUVsQixNQUFNLENBQUMsVUFBVSxHQUFHO1FBQ2hCLEdBQUcsRUFBRSxLQUFLO1FBQ1YsR0FBRyxFQUFFLEtBQUs7UUFDVixPQUFPLEVBQUUsU0FBUztRQUNsQixJQUFJLEVBQUUsTUFBTTtLQUNmLENBQUE7SUFFRixFQUFFLENBQUk7SUFDTixVQUFVLENBQVU7SUFDcEIsVUFBVSxDQUFRO0lBQ2xCLFFBQVEsQ0FBVTtJQUNsQixPQUFPLEdBQWEsRUFBRSxDQUFBO0lBQ3RCLE9BQU8sR0FBYyxFQUFFLENBQUE7SUFFdkIsY0FBYyxHQUFnQixFQUFFLENBQUE7SUFDaEMsU0FBUyxHQUFpQixFQUFFLENBQUE7SUFDNUIsWUFBWSxHQUFpQixFQUFFLENBQUE7SUFFL0IsT0FBTyxHQUE0QixFQUFFLENBQUE7SUFDckMsT0FBTyxHQUE2QyxFQUFFLENBQUE7SUFFdEQsTUFBTSxDQUFRO0lBQ2QsT0FBTyxDQUFTO0lBQ2hCLE9BQU8sQ0FBUztJQUNoQixPQUFPLENBQVM7SUFDaEIsY0FBYyxD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QUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO2FBQzFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQzthQUNuQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO2FBQ3pCLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDaEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO2FBQzFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQzthQUNuQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO2FBQ3pCLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDaEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO2FBQzlFLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQzthQUNuQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO2FBQ3pCLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxD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