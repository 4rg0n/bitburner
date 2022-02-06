import { NS, NodeStats } from '@ns'
import { asFormatGB } from 'lib/utils';

/**
 * Represents an ingame Hacknet Node
 */
export class HackNode {

    ns: NS
    idx: number

    constructor(ns : NS, idx : number) {
        this.ns = ns;
        this.idx = idx;
    }

    static get(ns : NS) : HackNode[] {
        const nodes : HackNode[] = [];

        for (let i = 0; i < ns.hacknet.numNodes(); i++) {
            nodes.push(new HackNode(ns, i));
        }

        return nodes;
    }

    upgrade() : boolean {
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

    canUpgrade(moneyAvail : number) : boolean {
        const cost = this.getUpgradeCost();

        return cost !== 0 && moneyAvail >= cost;
    }

    getUpgradeCost() : number {
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

    upgradeCache(num : number) : boolean {
        return this.ns.hacknet.upgradeCache(this.idx, num);
    }

    upgradeRam(num : number) : boolean {
        return this.ns.hacknet.upgradeRam(this.idx, num);
    }

    upgradeCore(num : number) : boolean {
        return this.ns.hacknet.upgradeCore(this.idx, num);
    }

    upgradeLevel(num : number) : boolean {
        return this.ns.hacknet.upgradeLevel(this.idx, num);
    }

    getCacheUpgradeCost(num : number) : number {
        return this.ns.hacknet.getCacheUpgradeCost(this.idx, num);
    }

    getRamUpgradeCost(num : number) : number {
        return this.ns.hacknet.getRamUpgradeCost(this.idx, num);
    }

    getCoreUpgradeCost(num : number) : number {
        return this.ns.hacknet.getCoreUpgradeCost(this.idx, num);
    }

    getLevelUpgradeCost(num : number) : number {
        return this.ns.hacknet.getLevelUpgradeCost(this.idx, num);
    }

    get isCacheMax() : boolean {
        return !Number.isFinite(this.getCacheUpgradeCost(1))
    }

    get isRamMax() : boolean {
        return !Number.isFinite(this.getRamUpgradeCost(1))
    }

    get isCoreMax() : boolean {
        return !Number.isFinite(this.getCoreUpgradeCost(1))
    }

    get isLevelMax() : boolean {
        return !Number.isFinite(this.getLevelUpgradeCost(1))
    }

    get isUpgradedMax() : boolean {
        return this.isLevelMax && this.isRamMax && this.isCoreMax //&& this.isCacheMax  
    }

    get stats() : NodeStats {
        return this.ns.hacknet.getNodeStats(this.idx);
    }
}