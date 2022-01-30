import { asFormat } from "lib/utils";
import { HackNode } from "node/HackNode";
export class NodePurchaser {
    ns;
    scale;
    max;
    moneyThreshold;
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
        this.max = max;
        this.ns.disableLog("ALL");
        if (moneyThreashhold > 0) {
            this.moneyThreshold = moneyThreashhold;
        }
        else {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTm9kZVB1cmNoYXNlci5qcyIsInNvdXJjZVJvb3QiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvc291cmNlcy8iLCJzb3VyY2VzIjpbIm5vZGUvTm9kZVB1cmNoYXNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQ3JDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFekMsTUFBTSxPQUFPLGFBQWE7SUFFdEIsRUFBRSxDQUFJO0lBQ04sS0FBSyxDQUFRO0lBQ2IsR0FBRyxDQUFRO0lBQ1gsY0FBYyxDQUFRO0lBRXRCOzs7Ozs7T0FNRztJQUNILFlBQVksRUFBTyxFQUFFLEtBQUssR0FBRyxFQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsRUFBRSxnQkFBZ0IsR0FBRyxDQUFDO1FBQzFELElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ2IsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFDZCxJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUUxQixJQUFJLGdCQUFnQixHQUFHLENBQUMsRUFBRTtZQUN0QixJQUFJLENBQUMsY0FBYyxHQUFHLGdCQUFnQixDQUFDO1NBQzFDO2FBQU07WUFDSCxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7U0FDN0Y7SUFDTCxDQUFDO0lBRUQsaUJBQWlCO1FBQ2IsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztRQUNo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