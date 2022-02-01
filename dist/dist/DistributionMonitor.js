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
                    content: new UIContainer([
                        new Animation([
                            "▶ ‣ ‣ ‣ ‣ ‣ ‣ ‣",
                            "‣ ▶ ‣ ‣ ‣ ‣ ‣ ‣",
                            "‣ ‣ ▶ ‣ ‣ ‣ ‣ ‣",
                            "‣ ‣ ‣ ▶ ‣ ‣ ‣ ‣",
                            "‣ ‣ ‣ ‣ ▶ ‣ ‣ ‣",
                            "‣ ‣ ‣ ‣ ‣ ▶ ‣ ‣",
                            "‣ ‣ ‣ ‣ ‣ ‣ ▶ ‣",
                            "‣ ‣ ‣ ‣ ‣ ‣ ‣ ▶",
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
                        "0x ",
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
        view.content.elements[0] = `${sharePower.toFixed(3)}x `;
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