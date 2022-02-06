import { Log } from "lib/Log";
import { ProgressBar, Progression } from "ui/ProgressBars";
import { ServerInfo } from "server/Scanner";
/**
 * For displaying server information in a log output window
 */
export class ServerMonitor {
    static MaxServerGrowth = 100;
    static MaxHackDifficulty = 100;
    ns;
    hosts;
    log;
    bars;
    /**
     * @param ns
     * @param hosts names of servers to monitor
     */
    constructor(ns, hosts = []) {
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
    /**
     * Collect server infos and display
     */
    monitor() {
        const serverInfos = ServerInfo.get(this.ns, this.hosts);
        this.display(serverInfos);
    }
    display(serverInfos) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VydmVyTW9uaXRvci5qcyIsInNvdXJjZVJvb3QiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvc291cmNlcy8iLCJzb3VyY2VzIjpbInNlcnZlci9TZXJ2ZXJNb25pdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFDOUIsT0FBTyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMzRCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFNUM7O0dBRUc7QUFDSCxNQUFNLE9BQU8sYUFBYTtJQUN0QixNQUFNLENBQUMsZUFBZSxHQUFHLEdBQUcsQ0FBQztJQUM3QixNQUFNLENBQUMsaUJBQWlCLEdBQUcsR0FBRyxDQUFDO0lBRS9CLEVBQUUsQ0FBSTtJQUNOLEtBQUssQ0FBVTtJQUNmLEdBQUcsQ0FBSztJQUNSLElBQUksQ0FBNEM7SUFFaEQ7OztPQUdHO0lBQ0gsWUFBWSxFQUFPLEVBQUUsUUFBbUIsRUFBRTtRQUN0QyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUNiLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdkIsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7UUFFZixJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLFdBQVcsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzdELElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksV0FBVyxDQUFDLElBQUksV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDekQsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxXQUFXLENBQUMsSUFBSSxXQUFXLENBQUMsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsV0FBVyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ25JLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksV0FBVyxDQUFDLElBQUksV0FBVyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLFdBQVcsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUMvSCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLFdBQVcsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFFRDs7T0FFRztJQUNILE9BQU87UUFDSCxNQUFNLFdBQVcsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3hELElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVELE9BQU8sQ0FBQyxXQUEwQjtRQUM5QixLQUFLLE1BQU0sVUFBVSxJQUFJLFdBQVcsRUFBRTtZQUNsQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxRQUFRLEtBQUssVUFBVSxDQUFDLElBQUksSUFBSSxDQUFDO2lCQUN2RCxHQUFHLENBQUMsZ0JBQWdCLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsY0FBYyxFQUFFLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUM7aUJBQ3BILEdBQUcsQ0FBQyxhQUFhLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO2lCQUN4RixHQUFHLENBQUMsY0FBYyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUUsRUFBRSxVQUFVLENBQUMsb0JBQW9CLENBQUMsRUFBRSxDQUFDO2lCQUNuSCxHQUFHLENBQUMsYUFBYSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLGNBQWMsRUFBRSxVQUFVLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztpQkFDbEcsR0FBRyxDQUFDLGFBQWEsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUUsYUFBYSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUM7aUJBQ3pHLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUNoQjtRQUVELElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDdkIsQ0FBQyJ9