import { NS } from "@ns";
import { asFormat } from "lib/utils";
import { HackNode } from "node/HackNode";

export class NodePurchaser {

    ns: NS
    scale: number
    max: number
    moneyThreshold: number
    
    /**
     * 
     * @param {NS} ns 
     * @param {number} scale percentage of money from available to use to purchase
     * @param {number} max amount of nodes to own. 0 means infinite
     * @param {number} moneyThreashhold when given, will only purchase when more than this amount of money is available
     */
    constructor(ns : NS, scale = 1, max = 0, moneyThreashhold = 0) {
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

    getAvailableMoney() : number {
        const moneyAvail = this.ns.getServerMoneyAvailable(this.ns.getHostname()) - this.moneyThreshold;
        if (moneyAvail < 0) {
            return 0;
        }

		return moneyAvail;
	}

    canBuyNode() : boolean {
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
    upgradeNodes(nodes : HackNode[] = []): void {
        nodes = (nodes.length > 0) ? nodes : HackNode.get(this.ns);
        nodes = nodes.filter(n => !n.isUpgradedMax);

        // buy new node
        if (nodes.length === 0) {
            if (!this.canBuyNode()) {
                return;
            }
            
            const newNode : HackNode | undefined = this.purchaseNode();
            
            if (typeof newNode !== "undefined") {
                nodes.push(newNode);
            }
        }

        // expensive first
        nodes = nodes.sort((a, b) => a.getUpgradeCost() - b.getUpgradeCost()).reverse();

        for (const idx in nodes) {
            const node = nodes[idx];
            const nextIdx = +idx + +1;
            const nextNode : HackNode = nodes[nextIdx];

            // next one is cheaper to upgrade?
            if (typeof nextNode !== "undefined" && nextNode.getUpgradeCost() < node.getUpgradeCost()) {
                continue;
            }

            // cheaper to purchase a new node than upgrading the current?
            if (node.getUpgradeCost() > this.getPurchaseNodeCost() && this.canBuyNode()) {
                const newNode : HackNode | undefined = this.purchaseNode();
                if (typeof newNode !== "undefined") {
                    nodes.push(newNode);
                }
                continue;
            }
    
            if (node.canUpgrade(this.getAvailableMoney())) {
                node.upgrade();
            }
        }
    }

    getPurchaseNodeCost() : number {
        return this.ns.hacknet.getPurchaseNodeCost();
    }

    /**
     * 
     * @returns {HackNode|undefined} when no node could be purchased undefined is returned
     */
    purchaseNode() : HackNode | undefined {
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

