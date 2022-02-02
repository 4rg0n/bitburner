import { asFormat } from "lib/utils";
import { HackNode } from "node/HackNode";
export class NodePurchaser {
    ns;
    max;
    moneyThreshold;
    /**
     *
     * @param {NS} ns
     * @param {number} max amount of nodes to own. 0 means infinite
     * @param {number} moneyThreashhold when given, will only purchase when more than this amount of money is available
     */
    constructor(ns, max = 0, moneyThreashhold = 0) {
        this.ns = ns;
        this.max = max;
        this.ns.disableLog("ALL");
        if (moneyThreashhold > 0) {
            this.moneyThreshold = moneyThreashhold;
        }
        else {
            this.moneyThreshold = 0;
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
        nodes = nodes.filter(n => !n.isUpgradedMax);
        // buy new node
        if (nodes.length === 0) {
            if (!this.canBuyNode()) {
                return;
            }
            const newNode = this.purchaseNode();
            if (typeof newNode !== "undefined") {
                nodes.push(newNode);
            }
        }
        // expensive first
        nodes = nodes.sort((a, b) => a.getUpgradeCost() - b.getUpgradeCost()).reverse();
        for (const idx in nodes) {
            const node = nodes[idx];
            const nextIdx = +idx + +1;
            const nextNode = nodes[nextIdx];
            // next one is cheaper to upgrade?
            if (typeof nextNode !== "undefined" && nextNode.getUpgradeCost() < node.getUpgradeCost()) {
                continue;
            }
            // cheaper to purchase a new node than upgrading the current?
            if (node.getUpgradeCost() > this.getPurchaseNodeCost() && this.canBuyNode()) {
                const newNode = this.purchaseNode();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTm9kZVB1cmNoYXNlci5qcyIsInNvdXJjZVJvb3QiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvc291cmNlcy8iLCJzb3VyY2VzIjpbIm5vZGUvTm9kZVB1cmNoYXNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQ3JDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFekMsTUFBTSxPQUFPLGFBQWE7SUFFdEIsRUFBRSxDQUFJO0lBQ04sR0FBRyxDQUFRO0lBQ1gsY0FBYyxDQUFRO0lBRXRCOzs7OztPQUtHO0lBQ0gsWUFBWSxFQUFPLEVBQUUsR0FBRyxHQUFHLENBQUMsRUFBRSxnQkFBZ0IsR0FBRyxDQUFDO1FBQzlDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ2IsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDZCxJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUUxQixJQUFJLGdCQUFnQixHQUFHLENBQUMsRUFBRTtZQUN0QixJQUFJLENBQUMsY0FBYyxHQUFHLGdCQUFnQixDQUFDO1NBQzFDO2FBQU07WUFDSCxJQUFJLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQztTQUMzQjtJQUNMLENBQUM7SUFFRCxpQkFBaUI7UUFDYixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDO1FBQ2hHLElBQUksVUFBVSxHQUFHLENBQUMsRUFBRTtZQUNoQixPQUFPLENBQUMsQ0FBQztTQUNaO1FBRVAsT0FBTyxVQUFVLENBQUM7SUFDbkIsQ0FBQztJQUVFLFVBQVU7UUFDTixJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxJQUFJLElBQUks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