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
    static ShareMode = {
        None: "none",
        All: "all",
        Balance: "balance"
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
    shareMode;
    doBoost;
    doAggro;
    homeMinRamFree;
    ramCap;
    ramMap;
    ramUsageHistory;
    constructor(ns, targetPool, deployer = undefined, workerType = Scheduler.WorkerType.All, taking = .5, shareMode = Scheduler.ShareMode.None, doBoost = false, doAggro = false, homeMinRamFree = 0, ramCap = 0) {
        this.ns = ns;
        this.targetPool = targetPool;
        this.workerType = workerType;
        this.deployer = deployer || new Deployer(ns, new Cracker(ns));
        this.taking = taking;
        this.shareMode = shareMode;
        this.doBoost = doBoost;
        this.doAggro = doAggro;
        this.homeMinRamFree = homeMinRamFree;
        this.ramCap = ramCap;
        this.ramMap = {};
        this.ramUsageHistory = new NumberStack([], 10);
    }
    static createWorkQueues(ns, targets, taking) {
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
    runner(server, target, id) {
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
                console.info(`Polled work ${work.script} ${work.threads} ${work.target.name}`);
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
            console.info(`Done work ${work.script} ${work.progress}/${work.threads} ${work.target.name}`);
            work.setStatus(WorkTicket.Status.Done);
        });
        this.waitingQueue = this.waitingQueue.filter(work => !work.isDone());
    }
    /**
     * Creates new work tickets
     */
    scheduleWork(scheduledWorks) {
        const works = scheduledWorks || this.scheduledQueue;
        switch (this.shareMode) {
            case Scheduler.ShareMode.All:
                this.scheduleShareWork(works);
                break;
            case Scheduler.ShareMode.Balance:
                for (const work of works) {
                    work.queue(this.canBoost());
                }
                this.scheduleShareWork(works);
                break;
            default:
            case Scheduler.ShareMode.None:
                for (const work of works) {
                    work.queue(this.canBoost());
                }
                break;
        }
    }
    scheduleShareWork(works, ramAvail) {
        if (works.length == 0)
            return;
        if (!this.canShare())
            return;
        if (typeof ramAvail === "undefined") {
            ramAvail = this.getTotalRamAvail(this.totalWorkersRamMax());
        }
        if (ramAvail <= 0)
            return;
        const ramPerWorkQueue = ramAvail / works.length;
        if (typeof ramPerWorkQueue !== "number" || Number.isNaN(ramPerWorkQueue) || !Number.isFinite(ramPerWorkQueue)) {
            return;
        }
        for (const work of works) {
            if (work.status !== WorkTicket.Status.Running || work.workQueue.isFull())
                continue;
            const ram = ramPerWorkQueue - work.getRamUsage();
            work.queueShare(ram, this.canBoost());
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
        if (typeof this.shareMode !== "string" || this.shareMode === "" || this.shareMode === Scheduler.ShareMode.None) {
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
    async deployHacksToServers(servers) {
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
    getTotalRamAvail(capacity) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2NoZWR1bGVyLmpzIiwic291cmNlUm9vdCI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9zb3VyY2VzLyIsInNvdXJjZXMiOlsiZGlzdC9TY2hlZHVsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzdDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDdkMsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUNyQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDM0MsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQ3ZDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFFeEM7O0dBRUc7QUFDSCxNQUFNLE9BQU8sU0FBUztJQUVsQixNQUFNLENBQUMsVUFBVSxHQUFHO1FBQ2hCLEdBQUcsRUFBRSxLQUFLO1FBQ1YsR0FBRyxFQUFFLEtBQUs7UUFDVixPQUFPLEVBQUUsU0FBUztRQUNsQixJQUFJLEVBQUUsTUFBTTtLQUNmLENBQUE7SUFFRCxNQUFNLENBQUMsU0FBUyxHQUFHO1FBQ2YsSUFBSSxFQUFFLE1BQU07UUFDWixHQUFHLEVBQUUsS0FBSztRQUNWLE9BQU8sRUFBRSxTQUFTO0tBQ3JCLENBQUE7SUFFRCxFQUFFLENBQUk7SUFDTixVQUFVLENBQVU7SUFDcEIsVUFBVSxDQUFRO0lBQ2xCLFFBQVEsQ0FBVTtJQUNsQixPQUFPLEdBQWEsRUFBRSxDQUFBO0lBQ3RCLE9BQU8sR0FBYyxFQUFFLENBQUE7SUFFdkIsY0FBYyxHQUFnQixFQUFFLENBQUE7SUFDaEMsU0FBUyxHQUFpQixFQUFFLENBQUE7SUFDNUIsWUFBWSxHQUFpQixFQUFFLENBQUE7SUFFL0IsT0FBTyxHQUE0QixFQUFFLENBQUE7SUFDckMsT0FBTyxHQUE2QyxFQUFFLENBQUE7SUFFdEQsTUFBTSxDQUFRO0lBQ2QsU0FBUyxDQUFRO0lBQ2pCLE9BQU8sQ0FBUztJQUNoQixPQUFPLENBQVM7SUFDaEIsY0FBYyxDQUFRO0lBQ3RCLE1BQU0sQ0FBUTtJQUNkLE1BQU0sQ0FBeUI7SUFDL0IsZUFBZSxDQUFhO0lBRTVCLFlBQ0ksRUFBTyxFQUNQLFVBQXFCLEVBQ3JCLFdBQWtDLFNBQVMsRUFDM0MsVUFBVSxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUNyQyxNQUFNLEdBQUcsRUFBRSxFQUNYLFNBQVMsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLElBQUksRUFDcEMsT0FBTyxHQUFHLEtBQUssRUFDZixPQUFPLEdBQUcsS0FBSyxFQUNmLGNBQWMsR0FBRyxDQUFDLEVBQ2xCLE1BQU0sR0FBRyxDQUFDO1FBRVYsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDYixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUM3QixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUM3QixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsSUFBSSxJQUFJLFFBQVEsQ0FBQyxFQUFFLEVBQUUsSUFBSSxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUU5RCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUMzQixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztRQUNyQyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNqQixJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksV0FBVyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBRUQsTUFBTSxDQUFDLGdCQUFnQixDQUFDLEVBQU8sRUFBRSxPQUFrQixFQUFFLE1BQWdCO1FBQ2pFLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksU0FBUyxDQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNwRSxDQUFDO0lBRUQ7O09BRUc7SUFDSCxNQUFNLENBQUMsWUFBWSxDQUFDLE9BQWtCLEVBQUUsTUFBTSxHQUFHLENBQUMsRUFBRSxjQUFjLEdBQUcsQ0FBQztRQUNsRSxNQUFNLE1BQU0sR0FBNkIsRUFBRSxDQUFDO1FBRTVDLElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDO1lBQUUsT0FBTyxNQUFNLENBQUM7UUFFeEMsbUJBQW1CO1FBQ25CLE9BQU8sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdEQsSUFBSSxRQUFRLEdBQUcsTUFBTSxDQUFDO1FBRXRCLEtBQUssTUFBTSxNQUFNLElBQUksT0FBTyxFQUFFO1lBQzFCLE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7WUFDbkMsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztZQUV6QixJQUFJLFFBQVEsSUFBSSxDQUFDLEVBQUU7Z0JBQ2YsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNwQjtpQkFBTSxJQUFJLFFBQVEsSUFBSSxZQUFZLEVBQUU7Z0JBQ2pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxZQUFZLENBQUM7Z0JBQzVCLFFBQVEsR0FBRyxRQUFRLEdBQUcsWUFBWSxDQUFDO2FBQ3RDO2lCQUFNO2dCQUNILE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUM7Z0JBQ3hCLFFBQVEsR0FBRyxRQUFRLEdBQUcsUUFBUSxDQUFDO2FBQ2xDO1NBQ0o7UUFFRCxJQUFJLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxXQUFXLEVBQUU7WUFDNUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLGNBQWMsQ0FBQztTQUM5RDtRQUVELE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFRCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBa0IsRUFBRSxVQUFtQjtRQUMzRCxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDM0IsUUFBUSxVQUFVLEVBQUU7Z0JBQ2hCLEtBQUssU0FBUyxDQUFDLFVBQVUsQ0FBQyxHQUFHO29CQUN6QixPQUFPLElBQUksQ0FBQztnQkFDaEIsS0FBSyxTQUFTLENBQUMsVUFBVSxDQUFDLEdBQUc7b0JBQ3pCLE9BQU8sTUFBTSxDQUFDLElBQUksS0FBSyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQztnQkFDakQsUUFBUTtnQkFDUixLQUFLLFNBQVMsQ0FBQyxVQUFVLENBQUMsT0FBTztvQkFDN0IsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7Z0JBQzFCLEtBQUssU0FBUyxDQUFDLFVBQVUsQ0FBQyxJQUFJO29CQUMxQixPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUM7YUFDNUI7UUFDTCxDQUFDLENBQUM7YUFDRCxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLElBQUk7UUFDTixNQUFNLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUVyQixJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNsQixJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNsQixJQUFJLENBQUMsY0FBYyxHQUFHLEVBQUUsQ0FBQztRQUV6QixNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3BFLElBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUNwRyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzNELElBQUksQ0FBQyxjQUFjLEdBQUcsU0FBUyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFckYsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3BELE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUVELFVBQVUsQ0FBQyxNQUFtQixFQUFFLElBQWEsRUFBRSxPQUFnQjtRQUMzRCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1lBQ3hCLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNqQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUM7SUFDNUMsQ0FBQztJQUVELFNBQVMsQ0FBQyxNQUFtQjtRQUN6QixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFRCxZQUFZLENBQUMsTUFBbUIsRUFBRSxJQUFhO1FBQzNDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsTUFBTSxDQUFDLE1BQWUsRUFBRSxNQUFlLEVBQUUsRUFBcUI7UUFDMUQsSUFBSSxJQUFJLENBQUM7UUFFVCxpRUFBaUU7UUFDakUsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ2QsSUFBSSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUMvQzthQUFNO1lBQ0gsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDbkI7UUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksSUFBSSxFQUFFLENBQUMsRUFBRTtZQUN6QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN4QyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksSUFBSSxJQUFJLEVBQUUsQ0FBQyxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDM0Y7UUFFRCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxJQUFJLElBQUksRUFBRSxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLE9BQU87UUFDVCxNQUFNLE9BQU8sR0FBSSxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQzlCLE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUVwQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNyQyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFMUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNqRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN0QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN2RCxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzdEO1NBQ0o7UUFDRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUU7WUFDcEMsTUFBTSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSyxDQUFDLFNBQVM7UUFDWCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBRTdCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3JDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUUxQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzVDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9CLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxVQUFVLENBQUMsTUFBTSxDQUFDLFVBQVU7b0JBQzVDLFNBQVM7Z0JBRWIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUM5RCxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFFL0MsSUFBSSxVQUFVLEdBQUcsQ0FBQztvQkFBRSxNQUFNO2dCQUMxQixJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO29CQUMvQixPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsT0FBTyxxQkFBcUIsTUFBTSxDQUFDLFVBQVUsT0FBTyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztvQkFDckgsU0FBUztpQkFDWjtnQkFFRCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFDbkUsTUFBTSxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBRXpDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQzVDLElBQUksQ0FBQyxRQUFRLElBQUksT0FBTyxDQUFDO2dCQUN6QixlQUFlO2dCQUNmLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO2dCQUV6QixPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxPQUFPLE9BQU8sTUFBTSxDQUFDLFVBQVUsT0FBTyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztnQkFFekgsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7b0JBQy9CLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDMUMsT0FBTyxDQUFDLElBQUksQ0FBQyx5QkFBeUIsSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO29CQUMxRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDaEM7YUFDSjtZQUVELElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFBRSxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ2hEO1FBRUQsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2pGLENBQUM7SUFFRDs7T0FFRztJQUNILFFBQVE7UUFDSixJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNoQyxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU87aUJBQ2xCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztpQkFDNUIsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNaLE9BQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUMvRSxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQzdDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzlCLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN6QixNQUFNLFFBQVEsR0FBRyxDQUFDLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUM7WUFDekMsT0FBTyxRQUFRLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztRQUM3RCxDQUFDLENBQUMsQ0FBQTtJQUNOLENBQUM7SUFFRDs7T0FFRztJQUNILFFBQVE7UUFDSixJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUM3QixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDMUIsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7b0JBQzdELElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM3QyxDQUFDLENBQUMsQ0FBQTtRQUNOLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDNUIsTUFBTSxPQUFPLEdBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUU5QixJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQztnQkFBRSxPQUFPLElBQUksQ0FBQztZQUV0QyxPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ2xHLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNkLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFDOUYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNDLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7SUFDekUsQ0FBQztJQUVEOztPQUVHO0lBQ0gsWUFBWSxDQUFDLGNBQTZCO1FBQ3RDLE1BQU0sS0FBSyxHQUFHLGNBQWMsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDO1FBRXBELFFBQU8sSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNuQixLQUFLLFNBQVMsQ0FBQyxTQUFTLENBQUMsR0FBRztnQkFDeEIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUM5QixNQUFNO1lBQ1YsS0FBSyxTQUFTLENBQUMsU0FBUyxDQUFDLE9BQU87Z0JBQzVCLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFO29CQUN0QixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO2lCQUMvQjtnQkFDRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzlCLE1BQU07WUFDVixRQUFRO1lBQ1IsS0FBSyxTQUFTLENBQUMsU0FBUyxDQUFDLElBQUk7Z0JBQ3pCLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFO29CQUN0QixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO2lCQUMvQjtnQkFDRCxNQUFNO1NBQ2I7SUFDTCxDQUFDO0lBRUQsaUJBQWlCLENBQUMsS0FBbUIsRUFBRSxRQUFrQjtRQUNyRCxJQUFJLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQztZQUFFLE9BQU87UUFDOUIsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFBRSxPQUFPO1FBRTdCLElBQUksT0FBTyxRQUFRLEtBQUssV0FBVyxFQUFFO1lBQ2pDLFFBQVEsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQztTQUMvRDtRQUVELElBQUksUUFBUSxJQUFJLENBQUM7WUFBRSxPQUFPO1FBRTFCLE1BQU0sZUFBZSxHQUFHLFFBQVEsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO1FBRWhELElBQUksT0FBTyxlQUFlLEtBQUssUUFBUSxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxFQUFFO1lBQzNHLE9BQU87U0FDVjtRQUVELEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFO1lBQ3RCLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxVQUFVLENBQUMsTUFBTSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRTtnQkFBRSxTQUFTO1lBRW5GLE1BQU0sR0FBRyxHQUFHLGVBQWUsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDakQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7U0FDekM7SUFDTCxDQUFDO0lBRUQsaUJBQWlCLENBQUMsTUFBbUI7UUFDakMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsT0FBTztZQUFFLE9BQU8sTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUVwQyxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNoRixDQUFDO0lBRUQsY0FBYztRQUNWLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUVEOztPQUVHO0lBQ0gsUUFBUTtRQUNKLElBQUksT0FBTyxJQUFJLENBQUMsU0FBUyxLQUFLLFFBQVEsSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLEVBQUUsSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLFNBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFO1lBQzVHLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO1FBRUQsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO0lBQ2hFLENBQUM7SUFFRDs7T0FFRztJQUNILFFBQVE7UUFDSixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNmLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO1FBRUYsT0FBTyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUVELGFBQWE7UUFDVCxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDbkMsQ0FBQztJQUVELGVBQWUsQ0FBQyxVQUFVLEdBQUcsR0FBRyxFQUFFLE1BQU0sR0FBRyxJQUFJLENBQUMsbUJBQW1CLEVBQUU7UUFDaEUsK0JBQStCO1FBQy9CLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQ2pDLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO1FBRUQsTUFBTSxpQkFBaUIsR0FBRyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDO1FBRXpFLElBQUksaUJBQWlCLEdBQUcsVUFBVSxFQUFFO1lBQ2hDLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO1FBRUQsTUFBTSxrQkFBa0IsR0FBRyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDO1FBRTNFLElBQUksa0JBQWtCLEdBQUcsVUFBVSxFQUFFO1lBQ2pDLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELEtBQUssQ0FBQyxHQUFHO1FBQ0wsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2hCLE1BQU0sSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNoQixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDMUIsQ0FBQztJQUVELEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxPQUFtQjtRQUMxQyxPQUFPLEdBQUcsT0FBTyxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRTVFLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBRUQsbUJBQW1CO1FBQ2YsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDOUMsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLFdBQVcsRUFBRTtZQUNoRCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7U0FDdEI7UUFFRCxPQUFPLFdBQVcsQ0FBQztJQUN2QixDQUFDO0lBRUQsZ0JBQWdCLENBQUMsUUFBa0I7UUFDL0IsSUFBSSxPQUFPLFFBQVEsS0FBSyxXQUFXLEVBQUU7WUFDakMsUUFBUSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1NBQ3pDO1FBRUQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzFGLE1BQU0sUUFBUSxHQUFHLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFFckMsSUFBSSxRQUFRLEdBQUcsQ0FBQyxFQUFFO1lBQ2QsT0FBTyxDQUFDLENBQUM7U0FDWjtRQUVELE9BQU8sUUFBUSxDQUFDO0lBQ3BCLENBQUM7SUFFRCxrQkFBa0I7UUFDZCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDMUYsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDO1FBQzFGLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUM5RixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDNUYsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUM7UUFFdkMsT0FBTztZQUNILEtBQUssRUFBRSxLQUFLO1lBQ1osSUFBSSxFQUFFLElBQUk7WUFDVixJQUFJLEVBQUUsSUFBSTtZQUNWLE1BQU0sRUFBRSxNQUFNO1lBQ2QsS0FBSyxFQUFFLEtBQUs7U0FDZixDQUFBO0lBQ0wsQ0FBQztJQUVELGtCQUFrQjtRQUNkLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQzthQUM3RSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO2FBQ3pCLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDaEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO2FBQzdFLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7YUFDekIsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNoQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7YUFDakYsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQzthQUN6QixNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2hDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQzthQUMvRSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO2FBQ3pCLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDaEMsTUFBTSxLQUFLLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUM7UUFFL0MsT0FBTztZQUNILEtBQUssRUFBRSxLQUFLO1lBQ1osSUFBSSxFQUFFLElBQUk7WUFDVixJQUFJLEVBQUUsSUFBSTtZQUNWLE1BQU0sRUFBRSxNQUFNO1lBQ2QsS0FBSyxFQUFFLEtBQUs7U0FDZixDQUFBO0lBQ0wsQ0FBQztJQUVELDZCQUE2QjtRQUN6QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7YUFDMUUsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO2FBQ25DLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7YUFDMUIsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNoQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7YUFDMUUsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO2FBQ25DLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7YUFDMUIsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNoQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7YUFDOUUsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO2FBQ25DLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7YUFDMUIsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNoQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7YUFDNUUsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO2FBQ25DLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7YUFDMUIsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNoQyxNQUFNLEtBQUssR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLEtBQUssQ0FBQztRQUUvQyxPQUFPO1lBQ0gsS0FBSyxFQUFFLEtBQUs7WUFDWixJQUFJLEVBQUUsSUFBSTtZQUNWLElBQUksRUFBRSxJQUFJO1lBQ1YsTUFBTSxFQUFFLE1BQU07WUFDZCxLQUFLLEVBQUUsS0FBSztTQUNmLENBQUE7SUFDTCxDQUFDO0lBRUQsMEJBQTBCO1FBQ3RCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQzthQUMxRSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7YUFDbkMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQzthQUN6QixNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2hDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQzthQUMxRSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7YUFDbkMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQzthQUN6QixNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2hDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQzthQUM5RSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7YUFDbkMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQzthQUN6QixNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2hDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQzthQUM1RSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7YUFDbkMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQzthQUN6QixNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FB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