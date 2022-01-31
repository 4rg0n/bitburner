import { Zerver } from "server/Zerver";
import { Log } from "lib/Log";
import { WorkTicket } from "dist/WorkTicket";
import { Distribution, ProgressBar, Progression, Progressions } from "ui/ProgressBars";
import { asLabel } from "lib/utils";
export class DistributionMonitor {
    static Templates = {
        DistSecurity: "dist-security",
        DistThreadsInit: "dist-threads-init",
        ThreadsInitProgress: "threads-init-progress",
        DistThreadsWaiting: "dist-threads-waiting",
        DistThreadsScheduled: "dist-threads-scheduled",
        Load: "load",
        Money: "money",
        Targets: "targets",
        Tickets: "tickets",
        Scale: "scale",
        Boost: "boost",
        Share: "share",
        Line: "line",
        Space: "space"
    };
    log;
    scheduler;
    purchaser;
    template;
    views;
    maxLabelWith;
    constructor(ns, scheduler, purchaser = undefined, template = []) {
        this.log = new Log(ns);
        this.scheduler = scheduler;
        this.purchaser = purchaser;
        this.template = template;
        this.views = {};
        this.template.forEach(t => this.register(t));
        this.maxLabelWith = this.calcLabelMaxWidth();
    }
    calcLabelMaxWidth() {
        const titleLengths = [];
        for (const template in this.views) {
            if (template === DistributionMonitor.Templates.Line || template === DistributionMonitor.Templates.Space) {
                continue;
            }
            const view = this.views[template];
            if (view.content instanceof Progressions || view.content instanceof Distribution) {
                continue;
            }
            const title = (typeof view.title === "string") ? view.title : template;
            titleLengths.push(title.length);
        }
        return Math.max(...titleLengths);
    }
    display() {
        this.template.forEach(t => this.add(t));
        this.log.display();
    }
    register(template = "") {
        switch (template.toLowerCase()) {
            case DistributionMonitor.Templates.DistSecurity:
                this.views[DistributionMonitor.Templates.DistSecurity] = {
                    title: "Security Distribution",
                    content: new Distribution(10, 0, Object.keys(Zerver.SecurityRank), 2, undefined, undefined, false)
                };
                break;
            case DistributionMonitor.Templates.DistThreadsInit:
                this.views[DistributionMonitor.Templates.DistThreadsInit] = {
                    title: "Threads Inititiating",
                    content: new Distribution(10, 0, ["hack", "grow", "weaken", "share"], 2)
                };
                break;
            case DistributionMonitor.Templates.DistThreadsWaiting:
                this.views[DistributionMonitor.Templates.DistThreadsWaiting] = {
                    title: "Threads Waiting",
                    content: new Distribution(10, 0, ["hack", "grow", "weaken", "share"], 2)
                };
                break;
            case DistributionMonitor.Templates.DistThreadsScheduled:
                this.views[DistributionMonitor.Templates.DistThreadsScheduled] = {
                    title: "Threads Scheduled",
                    content: new Distribution(10, 0, ["hack", "grow", "weaken", "share"], 2)
                };
                break;
            case DistributionMonitor.Templates.Targets:
                this.views[DistributionMonitor.Templates.Targets] = {
                    title: "Targets",
                    content: new Distribution(10, 0, [WorkTicket.Status.Initiating, WorkTicket.Status.Running], 2)
                };
                break;
            case DistributionMonitor.Templates.Tickets:
                this.views[DistributionMonitor.Templates.Tickets] = {
                    title: "Tickets",
                    content: new Distribution(10, 0, [WorkTicket.Status.Initiating, WorkTicket.Status.Running], 2)
                };
                break;
            case DistributionMonitor.Templates.ThreadsInitProgress:
                this.views[DistributionMonitor.Templates.ThreadsInitProgress] = {
                    title: "Threads Progress",
                    content: new Progressions(10, 0, ["total", "hack", "grow", "weaken", "share"], 2, [
                        Progression.Templates.Bar,
                        Progression.Templates.Ratio,
                        Progression.Templates.Percent
                    ])
                };
                break;
            case DistributionMonitor.Templates.Load:
                this.views[DistributionMonitor.Templates.Load] = {
                    title: undefined,
                    content: new Progression(new ProgressBar(10), Progression.Format.Byte)
                };
                break;
            case DistributionMonitor.Templates.Money:
                this.views[DistributionMonitor.Templates.Money] = {
                    title: undefined,
                    content: new Progression(new ProgressBar(10), undefined, [
                        Progression.Templates.Bar,
                        Progression.Templates.Ratio,
                        Progression.Templates.Percent
                    ])
                };
                break;
            case DistributionMonitor.Templates.Scale:
                this.views[DistributionMonitor.Templates.Scale] = {
                    title: undefined,
                    content: new Progression(new ProgressBar(10), undefined, [
                        Progression.Templates.Bar,
                        Progression.Templates.Ratio,
                        Progression.Templates.Percent
                    ])
                };
                break;
            case DistributionMonitor.Templates.Boost:
                this.views[DistributionMonitor.Templates.Boost] = {
                    title: undefined,
                    content: "Disabled"
                };
                break;
            case DistributionMonitor.Templates.Share:
                this.views[DistributionMonitor.Templates.Share] = {
                    title: undefined,
                    content: 0
                };
                break;
            case DistributionMonitor.Templates.Line:
            case DistributionMonitor.Templates.Space:
                break;
            default:
                console.warn(`Unknown template ${template} to register.`);
                break;
        }
    }
    add(template = "") {
        switch (template.toLowerCase()) {
            case DistributionMonitor.Templates.DistSecurity:
                this.addDistSecurity();
                break;
            case DistributionMonitor.Templates.DistThreadsInit:
                this.addDistThreadsInit();
                break;
            case DistributionMonitor.Templates.DistThreadsWaiting:
                this.addDistThreadsWaiting();
                break;
            case DistributionMonitor.Templates.DistThreadsScheduled:
                this.addDistThreadsScheduled();
                break;
            case DistributionMonitor.Templates.Targets:
                this.addTargets();
                break;
            case DistributionMonitor.Templates.Tickets:
                this.addTickets();
                break;
            case DistributionMonitor.Templates.ThreadsInitProgress:
                this.addThreadsInitProgress();
                break;
            case DistributionMonitor.Templates.Load:
                this.addLoad();
                break;
            case DistributionMonitor.Templates.Money:
                this.addMoney();
                break;
            case DistributionMonitor.Templates.Scale:
                this.addScale();
                break;
            case DistributionMonitor.Templates.Boost:
                this.addBoost();
                break;
            case DistributionMonitor.Templates.Share:
                this.addShare();
                break;
            case DistributionMonitor.Templates.Space:
                this.log.add("");
                break;
            case DistributionMonitor.Templates.Line:
                this.log.add("----------------------------------------------------");
                break;
            default:
                console.warn(`Unknown template ${template} to add to display.`);
                break;
        }
    }
    /**
     * @returns or null when view for template does not exist found
     */
    addView(template = "") {
        const view = this.views[template];
        if (typeof view === "undefined") {
            return undefined;
        }
        if (view.content instanceof Progressions || view.content instanceof Distribution) {
            if (typeof view.title !== "undefined") {
                this.log.add(`${view.title}:`);
            }
            this.log.add(`${view.content}`);
        }
        else {
            const title = (typeof view.title !== "undefined") ? asLabel(view.title, this.maxLabelWith) : asLabel(template, this.maxLabelWith);
            this.log.add(`${title} ${view.content}`);
        }
        return view;
    }
    addDistSecurity() {
        const view = this.addView(DistributionMonitor.Templates.DistSecurity);
        if (typeof view === "undefined") {
            return;
        }
        if (!(view.content instanceof Distribution)) {
            console.warn(`${DistributionMonitor.Templates.DistSecurity}: Could not set data, because content is not type ${Distribution.name}, is: ${typeof view.content}`);
            return;
        }
        const securityRanks = this.scheduler.distSecurityRanks();
        view.content.setDistribution(securityRanks);
    }
    addDistThreadsWaiting() {
        const view = this.addView(DistributionMonitor.Templates.DistThreadsWaiting);
        if (typeof view === "undefined") {
            return;
        }
        if (!(view.content instanceof Distribution)) {
            console.warn(`${DistributionMonitor.Templates.DistThreadsWaiting}: Could not set data, because content is not type ${Distribution.name}, is: ${typeof view.content}`);
            return;
        }
        const initTotalThreads = this.scheduler.distWaitingThreads();
        view.content.setDistribution(initTotalThreads);
    }
    addDistThreadsScheduled() {
        const view = this.addView(DistributionMonitor.Templates.DistThreadsScheduled);
        if (typeof view === "undefined") {
            return;
        }
        if (!(view.content instanceof Distribution)) {
            console.warn(`${DistributionMonitor.Templates.DistThreadsScheduled}: Could not set data, because content is not type ${Distribution.name}, is: ${typeof view.content}`);
            return;
        }
        const schedThreads = this.scheduler.distScheduledThreads();
        view.content.setDistribution(schedThreads);
    }
    addTargets() {
        const view = this.addView(DistributionMonitor.Templates.Targets);
        if (typeof view === "undefined") {
            return;
        }
        if (!(view.content instanceof Distribution)) {
            console.warn(`${DistributionMonitor.Templates.Targets}: Could not set data, because content is not type ${Distribution.name}, is: ${typeof view.content}`);
            return;
        }
        const totalTargetsRunning = this.scheduler.totalTargetsRunning();
        const totalTargetsInitiating = this.scheduler.totalTargetsInitiating();
        const data = {};
        data[WorkTicket.Status.Initiating] = totalTargetsRunning;
        data[WorkTicket.Status.Running] = totalTargetsInitiating;
        data.total = this.scheduler.targets.length;
        view.content.setDistribution(data);
    }
    addTickets() {
        const view = this.addView(DistributionMonitor.Templates.Tickets);
        if (typeof view === "undefined") {
            return;
        }
        if (!(view.content instanceof Distribution)) {
            console.warn(`${DistributionMonitor.Templates.Tickets}: Could not set data, because content is not type ${Distribution.name}, is: ${typeof view.content}`);
            return;
        }
        const data = {};
        data[WorkTicket.Status.Initiating] = this.scheduler.initQueue.length;
        data[WorkTicket.Status.Running] = this.scheduler.waitingQueue.length;
        data.total = this.scheduler.initQueue.length + this.scheduler.waitingQueue.length;
        view.content.setDistribution(data);
    }
    addDistThreadsInit() {
        const view = this.addView(DistributionMonitor.Templates.DistThreadsInit);
        if (typeof view === "undefined") {
            return;
        }
        if (!(view.content instanceof Distribution)) {
            console.warn(`${DistributionMonitor.Templates.DistThreadsInit}: Could not set data, because content is not type ${Distribution.name}, is: ${typeof view.content}`);
            return;
        }
        const waitingThreads = this.scheduler.distInitiatingTotalThreads();
        view.content.setDistribution(waitingThreads);
    }
    addThreadsInitProgress() {
        const view = this.addView(DistributionMonitor.Templates.ThreadsInitProgress);
        if (typeof view === "undefined") {
            return;
        }
        if (!(view.content instanceof Progressions)) {
            console.warn(`${DistributionMonitor.Templates.ThreadsInitProgress}: Could not set data, because content is not type ${Progressions.name}, is: ${typeof view.content}`);
            return;
        }
        const initTotalThreads = this.scheduler.distInitiatingTotalThreads();
        const initProgressThreads = this.scheduler.distInitiatingProgressThreads();
        view.content.setProgress({
            total: { value: initProgressThreads.total, total: initTotalThreads.total },
            hack: { value: initProgressThreads.hack, total: initTotalThreads.hack },
            grow: { value: initProgressThreads.grow, total: initTotalThreads.grow },
            weaken: { value: initProgressThreads.weaken, total: initTotalThreads.weaken },
            share: { value: initProgressThreads.share, total: initTotalThreads.share },
        });
    }
    addLoad() {
        const view = this.addView(DistributionMonitor.Templates.Load);
        if (typeof view === "undefined") {
            return;
        }
        if (!(view.content instanceof Progression)) {
            console.warn(`${DistributionMonitor.Templates.Load}: Could not set data, because content is not type ${Progression.name}, is: ${typeof view.content}`);
            return;
        }
        const totalRamMax = this.scheduler.totalWorkersRamMax();
        const totalRamUsed = this.scheduler.totalWorkersRamUsed();
        view.content.setProgress(totalRamUsed, totalRamMax);
    }
    addMoney() {
        const view = this.addView(DistributionMonitor.Templates.Money);
        if (typeof view === "undefined") {
            return;
        }
        if (!(view.content instanceof Progression)) {
            console.warn(`${DistributionMonitor.Templates.Money}: Could not set data, because content is not type ${Progression.name}, is: ${typeof view.content}`);
            return;
        }
        const totalMoneyMax = this.scheduler.totalTargetsMoneyMax();
        const totalMoneyAvail = this.scheduler.totalTargetsMoneyAvail();
        view.content.setProgress(totalMoneyAvail, totalMoneyMax);
    }
    addScale() {
        if (typeof this.purchaser === "undefined") {
            return;
        }
        const view = this.addView(DistributionMonitor.Templates.Scale);
        if (typeof view === "undefined") {
            return;
        }
        if (!(view.content instanceof Progression)) {
            console.warn(`${DistributionMonitor.Templates.Scale}: Could not set data, because content is not type ${Progression.name}, is: ${typeof view.content}`);
            return;
        }
        const moneyToBuyServers = this.purchaser.getAvailableMoney();
        const moneyTotalUpgrade = this.purchaser.getNextUpgradeCosts();
        view.content.setProgress(moneyToBuyServers, moneyTotalUpgrade);
    }
    addBoost() {
        const view = this.addView(DistributionMonitor.Templates.Boost);
        if (typeof view === "undefined") {
            return;
        }
        view.content = (this.scheduler.canBoost()) ? "Enabled" : "Disabled";
    }
    addShare() {
        const view = this.addView(DistributionMonitor.Templates.Share);
        if (typeof view === "undefined") {
            return;
        }
        view.content = `${this.scheduler.getSharePower().toFixed(3)}x`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGlzdHJpYnV0aW9uTW9uaXRvci5qcyIsInNvdXJjZVJvb3QiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvc291cmNlcy8iLCJzb3VyY2VzIjpbImRpc3QvRGlzdHJpYnV0aW9uTW9uaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXZDLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFDOUIsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzdDLE9BQU8sRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUN2RixPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBSXBDLE1BQU0sT0FBTyxtQkFBbUI7SUFFNUIsTUFBTSxDQUFDLFNBQVMsR0FBRztRQUNmLFlBQVksRUFBRSxlQUFlO1FBQzdCLGVBQWUsRUFBRSxtQkFBbUI7UUFDcEMsbUJBQW1CLEVBQUUsdUJBQXVCO1FBQzVDLGtCQUFrQixFQUFFLHNCQUFzQjtRQUMxQyxvQkFBb0IsRUFBRSx3QkFBd0I7UUFDOUMsSUFBSSxFQUFFLE1BQU07UUFDWixLQUFLLEVBQUUsT0FBTztRQUNkLE9BQU8sRUFBRSxTQUFTO1FBQ2xCLE9BQU8sRUFBRSxTQUFTO1FBQ2xCLEtBQUssRUFBRSxPQUFPO1FBQ2QsS0FBSyxFQUFFLE9BQU87UUFDZCxLQUFLLEVBQUUsT0FBTztRQUNkLElBQUksRUFBRSxNQUFNO1FBQ1osS0FBSyxFQUFFLE9BQU87S0FDakIsQ0FBQTtJQUVELEdBQUcsQ0FBSztJQUNSLFNBQVMsQ0FBVztJQUNwQixTQUFTLENBQXVCO0lBQ2hDLFFBQVEsQ0FBVTtJQUNsQixLQUFLLENBQXdKO0lBQzdKLFlBQVksQ0FBUTtJQUVwQixZQUFZLEVBQU8sRUFBRSxTQUFxQixFQUFFLFlBQW9DLFNBQVMsRUFBRSxX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