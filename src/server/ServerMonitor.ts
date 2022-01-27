import { NS } from "@ns";
import { Log } from "lib/Log";
import { ProgressBar, Progression } from "ui/ProgressBars";
import { ServerInfo } from "server/Scanner";

export class ServerMonitor {
    static MaxServerGrowth = 100;
    static MaxHackDifficulty = 100;

    ns: NS
    hosts: string[]
    log: Log
    bars: {[key: string]: Progression | ProgressBar}

    constructor(ns : NS, hosts : string[] = []) {
        this.ns = ns;
        this.hosts = hosts;
        this.log = new Log(ns);
        this.bars = {};

        this.bars.securityBar = new Progression(new ProgressBar(10));
        this.bars.loadBar = new Progression(new ProgressBar(10));
        this.bars.hackSkillBar = new Progression(new ProgressBar(10), undefined, [Progression.Templates.Bar, Progression.Templates.Ratio]);
        this.bars.moneyBar = new Progression(new ProgressBar(10), undefined, [Progression.Templates.Bar, Progression.Templates.Ratio]);
        this.bars.growBar = new Progression(new ProgressBar(10));
    }

    monitor(): void {
        const serverInfos = ServerInfo.get(this.ns, this.hosts);
        this.display(serverInfos);
    }

    display(serverInfos : ServerInfo[]) : void {
        for (const serverInfo of serverInfos) {
            this.log.add(`${serverInfo.hostname} (${serverInfo.type}):`)         
                .add(`  Security:\t${this.bars.securityBar.setProgress(serverInfo.hackDifficulty, ServerMonitor.MaxHackDifficulty)}`)
                .add(`  Load: \t${this.bars.loadBar.setProgress(serverInfo.ramUsed, serverInfo.maxRam)}`)
                .add(`  Skill: \t${this.bars.hackSkillBar.setProgress(this.ns.getHackingLevel(), serverInfo.requiredHackingSkill)}`)
                .add(`  Money:\t${this.bars.moneyBar.setProgress(serverInfo.moneyAvailable, serverInfo.moneyMax)}`)
                .add(`  Grow: \t${this.bars.growBar.setProgress(serverInfo.serverGrowth, ServerMonitor.MaxServerGrowth)}`)
                .add("");
        }

        this.log.display();
    }
}