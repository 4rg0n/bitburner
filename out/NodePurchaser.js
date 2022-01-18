// @ts-check
/** @typedef {import(".").NS} NS */
/** @typedef {import(".").NodeStats} NodeStats */

import { asFormat, asFormatGB } from "./utils.js";

export class NodePurchaser {
    
    /**
     * 
     * @param {NS} ns 
     * @param {number} scale percentage of money from available to use to purchase
     * @param {number} max amount of nodes to own. 0 means infinite
     * @param {number} moneyThreashhold when given, will only purchase when more than this amount of money is available
     */
    constructor(ns, scale = .5, max = 0, moneyThreashhold = 0) {
        this.ns = ns;
        this.scale = scale;
        this.max = max
        this.ns.disableLog("ALL");

        if (moneyThreashhold > 0) {
            this.moneyThreshold = moneyThreashhold;
        } else {
            this.moneyThreshold = this.ns.getServerMoneyAvailable(this.ns.getHostname()) * this.scale;
        }
    }

    getAvailableMoney() {
        const moneyAvail = this.ns.getServerMoneyAvailable(this.ns.getHostname()) - this.moneyThreshold;
        if (moneyAvail < 0) {
            return 0;
        }

		return moneyAvail;
	}

    canBuyNode() {
        if (this.ns.hacknet.numNodes() >= this.max) {
            return false;
        }

        return this.getAvailableMoney() >= this.getPurchaseNodeCost();
    }

    /**
     * 
     * @param {HackNode[]} nodes 
     * @returns {HackNode[]} 
     */
    upgradeNodes(nodes = []) {
        nodes = (nodes.length > 0) ? nodes : HackNode.get(this.ns);

        if (nodes.length === 0) {
            if (!this.canBuyNode()) {
                return;
            }

            
            nodes.push(this.purchaseNode());
        }

        // expensive first
        nodes.sort((a, b) => a.getUpgradeCost() - b.getUpgradeCost());

        for (let idx in nodes) {
            const node = nodes[idx];
            const nextNode = nodes[idx + 1];

            // next one is cheaper to upgrade?
            if (typeof nextNode !== "undefined" && nextNode.getUpgradeCost() < node.getUpgradeCost()) {
                continue;
            }

            // cheaper to purchase a new node than upgrading the current?
            if (node.getUpgradeCost() > this.getPurchaseNodeCost() && this.canBuyNode()) {
                let newNode = this.purchaseNode();
                nodes.push(newNode);
                continue;
            }
    
            if (node.canUpgrade(this.getAvailableMoney())) {
                node.upgrade();
            }
        }
    }

    getPurchaseNodeCost() {
        return this.ns.hacknet.getPurchaseNodeCost();
    }

    /**
     * 
     * @returns {HackNode|undefined} when no node could be purchased undefined is returned
     */
    purchaseNode() {
        const cost = this.getPurchaseNodeCost();
        const idx = this.ns.hacknet.purchaseNode();

        if (idx < 0) {
            return undefined;
        }

        const msg = `Purchased new node: #${idx} for ${asFormat(cost)}`;

        this.ns.print(msg);
        this.ns.toast(msg, "success", 10000);

        return new HackNode(this.ns, idx);
    }
}

export class HackNode {
    /**
     * 
     * @param {NS} ns 
     * @param {number} idx
     */
    constructor(ns, idx) {
        this.ns = ns;
        this.idx = idx;
    }

    /**
     * 
     * @param {NS} ns
     * 
     * @returns {HackNode[]} 
     */
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

    /**
     * 
     * @param {number} moneyAvail 
     * @returns {boolean}
     */
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

    /**
     * 
     * @param {number} num 
     * @returns {boolean}
     */
    upgradeCache(num) {
        return this.ns.hacknet.upgradeCache(this.idx, num);
    }

    /**
     * 
     * @param {number} num 
     * @returns {boolean}
     */
    upgradeRam(num) {
        return this.ns.hacknet.upgradeRam(this.idx, num);
    }

    /**
     * 
     * @param {number} num 
     * @returns {boolean}
     */
    upgradeCore(num) {
        return this.ns.hacknet.upgradeCore(this.idx, num);
    }

    /**
     * 
     * @param {number} num 
     * @returns {boolean}
     */
    upgradeLevel(num) {
        return this.ns.hacknet.upgradeLevel(this.idx, num);
    }

    /**
     * 
     * @param {number} num 
     * @returns {number}
     */
    getCacheUpgradeCost(num) {
        return this.ns.hacknet.getCacheUpgradeCost(this.idx, num);
    }

    /**
     * 
     * @param {number} num 
     * @returns {number}
     */
    getRamUpgradeCost(num) {
        return this.ns.hacknet.getRamUpgradeCost(this.idx, num);
    }

    /**
     * 
     * @param {number} num 
     * @returns {number}
     */
    getCoreUpgradeCost(num) {
        return this.ns.hacknet.getCoreUpgradeCost(this.idx, num);
    }

    /**
     * 
     * @param {number} num 
     * @returns {number}
     */
    getLevelUpgradeCost(num) {
        return this.ns.hacknet.getLevelUpgradeCost(this.idx, num);
    }

    get isCacheMax() {
        return !Number.isFinite(this.getCacheUpgradeCost(1))
    }

    get isRamMax() {
        return !Number.isFinite(this.getRamUpgradeCost(1))
    }

    get isCoreMax() {
        return !Number.isFinite(this.getCoreUpgradeCost(1))
    }

    get isLevelMax() {
        return !Number.isFinite(this.getLevelUpgradeCost(1))
    }

    get isUpgradedMax() {
        return this.isLevelMax && this.isRamMax && this.isCoreMax //&& this.isCacheMax  
    }

    /**
     * 
     * @returns {NodeStats}
     */
    get stats() {
        return this.ns.hacknet.getNodeStats(this.idx);
    }
}