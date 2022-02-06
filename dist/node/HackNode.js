import { asFormatGB } from 'lib/utils';
/**
 * Represents an ingame Hacknet Node
 */
export class HackNode {
    ns;
    idx;
    constructor(ns, idx) {
        this.ns = ns;
        this.idx = idx;
    }
    static get(ns) {
        const nodes = [];
        for (let i = 0; i < ns.hacknet.numNodes(); i++) {
            nodes.push(new HackNode(ns, i));
        }
        return nodes;
    }
    upgrade() {
        const levelCost = this.getLevelUpgradeCost(1);
        const ramCost = this.getRamUpgradeCost(1);
        if (!this.isLevelMax && levelCost <= ramCost) {
            this.upgradeLevel(1);
            this.ns.print(`Upgraded node #${this.idx} Level to ${this.stats.level}`);
            return true;
        }
        const coreCost = this.getCoreUpgradeCost(1);
        if (!this.isRamMax && ramCost <= coreCost) {
            this.upgradeRam(1);
            this.ns.print(`Upgraded node #${this.idx} RAM to ${asFormatGB(this.stats.ram)}`);
            return true;
        }
        if (!this.isCoreMax) {
            this.upgradeCore(1);
            this.ns.print(`Upgraded node #${this.idx} Cores to ${this.stats.cores}`);
            return true;
        }
        return false;
    }
    canUpgrade(moneyAvail) {
        const cost = this.getUpgradeCost();
        return cost !== 0 && moneyAvail >= cost;
    }
    getUpgradeCost() {
        const levelCost = this.getLevelUpgradeCost(1);
        const ramCost = this.getRamUpgradeCost(1);
        if (!this.isLevelMax && levelCost <= ramCost) {
            return levelCost;
        }
        const coreCost = this.getCoreUpgradeCost(1);
        if (!this.isRamMax && ramCost <= coreCost) {
            return ramCost;
        }
        if (!this.isCoreMax) {
            return coreCost;
        }
        return 0;
    }
    upgradeCache(num) {
        return this.ns.hacknet.upgradeCache(this.idx, num);
    }
    upgradeRam(num) {
        return this.ns.hacknet.upgradeRam(this.idx, num);
    }
    upgradeCore(num) {
        return this.ns.hacknet.upgradeCore(this.idx, num);
    }
    upgradeLevel(num) {
        return this.ns.hacknet.upgradeLevel(this.idx, num);
    }
    getCacheUpgradeCost(num) {
        return this.ns.hacknet.getCacheUpgradeCost(this.idx, num);
    }
    getRamUpgradeCost(num) {
        return this.ns.hacknet.getRamUpgradeCost(this.idx, num);
    }
    getCoreUpgradeCost(num) {
        return this.ns.hacknet.getCoreUpgradeCost(this.idx, num);
    }
    getLevelUpgradeCost(num) {
        return this.ns.hacknet.getLevelUpgradeCost(this.idx, num);
    }
    get isCacheMax() {
        return !Number.isFinite(this.getCacheUpgradeCost(1));
    }
    get isRamMax() {
        return !Number.isFinite(this.getRamUpgradeCost(1));
    }
    get isCoreMax() {
        return !Number.isFinite(this.getCoreUpgradeCost(1));
    }
    get isLevelMax() {
        return !Number.isFinite(this.getLevelUpgradeCost(1));
    }
    get isUpgradedMax() {
        return this.isLevelMax && this.isRamMax && this.isCoreMax; //&& this.isCacheMax  
    }
    get stats() {
        return this.ns.hacknet.getNodeStats(this.idx);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSGFja05vZGUuanMiLCJzb3VyY2VSb290IjoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL3NvdXJjZXMvIiwic291cmNlcyI6WyJub2RlL0hhY2tOb2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFFdkM7O0dBRUc7QUFDSCxNQUFNLE9BQU8sUUFBUTtJQUVqQixFQUFFLENBQUk7SUFDTixHQUFHLENBQVE7SUFFWCxZQUFZLEVBQU8sRUFBRSxHQUFZO1FBQzdCLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ2IsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFDbkIsQ0FBQztJQUVELE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBTztRQUNkLE1BQU0sS0FBSyxHQUFnQixFQUFFLENBQUM7UUFFOUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDNUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLFFBQVEsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNuQztRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFRCxPQUFPO1FBQ0gsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUUxQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxTQUFTLElBQUksT0FBTyxFQUFFO1lBQzFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLElBQUksQ0FBQyxHQUFHLGFBQWEsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQ3pFLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFFRCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFNUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksT0FBTyxJQUFJLFFBQVEsRUFBRTtZQUN2QyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25CLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLGtCQUFrQixJQUFJLENBQUMsR0FBRyxXQUFXLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNqRixPQUFPLElBQUksQ0FBQztTQUNmO1FBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDakIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQixJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsSUFBSSxDQUFDLEdBQUcsYUFBYSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDekUsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFRCxVQUFVLENBQUMsVUFBbUI7UUFDMUIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRW5DLE9BQU8sSUFBSSxLQUFLLENBQUMsSUFBSSxVQUFVLElBQUksSUFBSSxDQUFDO0lBQzVDLENBQUM7SUFFRCxjQUFjO1FBQ1YsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUUxQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxTQUFTLElBQUksT0FBTyxFQUFFO1lBQzFDLE9BQU8sU0FBUyxDQUFDO1NBQ3BCO1FBRUQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTVDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLE9BQU8sSUFBSSxRQUFRLEVBQUU7WUFDdkMsT0FBTyxPQUFPLENBQUM7U0FDbEI7UUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNqQixPQUFPLFFBQVEsQ0FBQztTQUNuQjtRQUVELE9BQU8sQ0FBQyxDQUFDO0lBQ2IsQ0FBQztJQUVELFlBQVksQ0FBQyxHQUFZO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUVELFVBQVUsQ0FBQyxHQUFZO1FBQ25CLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUVELFdBQVcsQ0FBQyxHQUFZO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVELFlBQVksQ0FBQyxHQUFZO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUVELG1CQUFtQixDQUFDLEdBQVk7UUFDNUIsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFFRCxpQkFBaUIsQ0FBQyxHQUFZO1FBQzFCLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBRUQsa0JBQWtCLENBQUMsR0FBWTtRQUMzQixPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUVELG1CQUFtQixDQUFDLEdBQVk7UUFDNUIsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFFRCxJQUFJLFVBQVU7UUFDVixPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUN4RCxDQUFDO0lBRUQsSUFBSSxRQUFRO1FBQ1IsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDdEQsQ0FBQztJQUVELElBQUksU0FBUztRQUNULE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3ZELENBQUM7SUFFRCxJQUFJLFVBQVU7UUFDVixPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUN4RCxDQUFDO0lBRUQsSUFBSSxhQUFhO1FBQ2IsT0FBTyxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQSxDQUFDLHNCQUFzQjtJQUNwRixDQUFDO0lBRUQsSUFBSSxLQUFLO1FBQ0wsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2xELENBQUM7Q0FDSiJ9