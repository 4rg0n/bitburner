import { asFormat } from "lib/utils";
import { HackNode } from "node/HackNode";
/**
 * For purchasing and upgrading Hacknet Nodes
 */
export class NodePurchaser {
    ns;
    max;
    moneyThreshold;
    /**
     *
     * @param ns
     * @param max amount of nodes to own. 0 means infinite
     * @param moneyThreashhold when given, will only purchase when more than this amount of money is available
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
     * Try to upgrade owned nodes and buy new ones if cheaper.
     * Should be run in a loop.
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
        // most expensive first
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
     * @returns purchased node or undefined when no node could be purchased
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTm9kZVB1cmNoYXNlci5qcyIsInNvdXJjZVJvb3QiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvc291cmNlcy8iLCJzb3VyY2VzIjpbIm5vZGUvTm9kZVB1cmNoYXNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQ3JDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFekM7O0dBRUc7QUFDSCxNQUFNLE9BQU8sYUFBYTtJQUV0QixFQUFFLENBQUk7SUFDTixHQUFHLENBQVE7SUFDWCxjQUFjLENBQVE7SUFFdEI7Ozs7O09BS0c7SUFDSCxZQUFZLEVBQU8sRUFBRSxHQUFHLEdBQUcsQ0FBQyxFQUFFLGdCQUFnQixHQUFHLENBQUM7UUFDOUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDYixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQTtRQUNkLElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRTFCLElBQUksZ0JBQWdCLEdBQUcsQ0FBQyxFQUFFO1lBQ3RCLElBQUksQ0FBQyxjQUFjLEdBQUcsZ0JBQWdCLENBQUM7U0FDMUM7YUFBTTtZQUNILElBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDO1NBQzNCO0lBQ0wsQ0FBQztJQUVELGlCQUFpQjtRQUNiLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7UUFDaEcsSUFBSSxVQUFVLEdBQUcsQ0FBQyxFQUFFO1lBQ2hCLE9BQU8sQ0FBQyxDQUFDO1NBQ1o7UUFFUCxPQUFPLFVBQVUsQ0FBQztJQUNuQixDQUFDO0lBRUUsVUFBVTtRQUNOLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFF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