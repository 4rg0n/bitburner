import { Zerver } from "server/Zerver";
import { Log } from "lib/Log";
import { WorkTicket } from "dist/WorkTicket";
import { Distribution, ProgressBar, Progression, Progressions } from "ui/ProgressBars";
import { asLabel } from "lib/utils";
import { Animation } from "/ui/Animation";
import { UIContainer } from "/ui/UI";
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
    constructor(ns, scheduler, purchaser, template = []) {
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
                    content: new UIContainer([
                        new Animation([
                            ">...........",
                            ".>..........",
                            "..>.........",
                            "...>........",
                            "....>.......",
                            ".....>......",
                            "......>.....",
                            "......>.....",
                            ".......>....",
                            "........>...",
                            ".........>..",
                            "..........>.",
                            "...........>"
                        ]),
                        new Animation([
                            ":...........",
                            ".:..........",
                            "..:.........",
                            "...:........",
                            "....:.......",
                            ".....:......",
                            "......:.....",
                            "......:.....",
                            ".......:....",
                            "........:...",
                            ".........:..",
                            "..........:.",
                            "...........:"
                        ])
                    ])
                };
                break;
            case DistributionMonitor.Templates.Share:
                this.views[DistributionMonitor.Templates.Share] = {
                    title: undefined,
                    content: new UIContainer([
                        `0x (${this.scheduler.shareMode})`,
                        new Animation(["◴", "◷", "◶", "◵"]),
                        new Animation(["◇", "◈", "◆", "◈"])
                    ])
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
                this.log.add("---------------------------------------------------");
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
        if (!(view.content instanceof UIContainer)) {
            console.warn(`${DistributionMonitor.Templates.Share}: Could not set data, because content is not type ${UIContainer.name}, is: ${typeof view.content}`);
            return;
        }
        const canBoost = this.scheduler.canBoost();
        // idle
        if (view.content.elements[0] instanceof Animation) {
            view.content.elements[0].show(canBoost);
        }
        // boosting
        if (view.content.elements[1] instanceof Animation) {
            view.content.elements[1].show(!canBoost);
        }
    }
    addShare() {
        const view = this.addView(DistributionMonitor.Templates.Share);
        if (typeof view === "undefined") {
            return;
        }
        if (!(view.content instanceof UIContainer)) {
            console.warn(`${DistributionMonitor.Templates.Share}: Could not set data, because content is not type ${UIContainer.name}, is: ${typeof view.content}`);
            return;
        }
        const sharePower = this.scheduler.getSharePower();
        // todo need kind of a container to put a ui element and other stuff in it o.o
        view.content.elements[0] = `${sharePower.toFixed(3)}x (${this.scheduler.shareMode})`;
        // idle
        if (view.content.elements[1] instanceof Animation) {
            view.content.elements[1].show(sharePower > 1);
        }
        // sharing
        if (view.content.elements[2] instanceof Animation) {
            view.content.elements[2].show(sharePower <= 1);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGlzdHJpYnV0aW9uTW9uaXRvci5qcyIsInNvdXJjZVJvb3QiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvc291cmNlcy8iLCJzb3VyY2VzIjpbImRpc3QvRGlzdHJpYnV0aW9uTW9uaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXZDLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFDOUIsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzdDLE9BQU8sRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUN2RixPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBR3BDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDMUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLFFBQVEsQ0FBQztBQUVyQyxNQUFNLE9BQU8sbUJBQW1CO0lBRTVCLE1BQU0sQ0FBQyxTQUFTLEdBQUc7UUFDZixZQUFZLEVBQUUsZUFBZTtRQUM3QixlQUFlLEVBQUUsbUJBQW1CO1FBQ3BDLG1CQUFtQixFQUFFLHVCQUF1QjtRQUM1QyxrQkFBa0IsRUFBRSxzQkFBc0I7UUFDMUMsb0JBQW9CLEVBQUUsd0JBQXdCO1FBQzlDLElBQUksRUFBRSxNQUFNO1FBQ1osS0FBSyxFQUFFLE9BQU87UUFDZCxPQUFPLEVBQUUsU0FBUztRQUNsQixPQUFPLEVBQUUsU0FBUztRQUNsQixLQUFLLEVBQUUsT0FBTztRQUNkLEtBQUssRUFBRSxPQUFPO1FBQ2QsS0FBSyxFQUFFLE9BQU87UUFDZCxJQUFJLEVBQUUsTUFBTTtRQUNaLEtBQUssRUFBRSxPQUFPO0tBQ2pCLENBQUE7SUFFRCxHQUFHLENBQUs7SUFDUixTQUFTLENBQVc7SUFDcEIsU0FBUyxDQUF1QjtJQUNoQyxRQUFRLENBQVU7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