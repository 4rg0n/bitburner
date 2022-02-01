import { Flags } from "lib/Flags";
import { NodePurchaser } from "node/NodePurchaser";
import { HackNode } from "node/HackNode";
import { asFormatGB, fromFormat } from "lib/utils";
/**
 * For purchasing or upgrading servers
 */
export async function main(ns) {
    const flags = new Flags(ns, [
        ["upgrade", 0, "Number of upgrade cycles. 0 is infinite"],
        ["scale", 0.5, "How much of available money shall be used in percent from 0 to 1"],
        ["max", 23, "How many nodes to buy max. 0 is infinite."],
        ["money", "", "Will not go under this amount of money when purchasing. Can be formatted in: e.g. 100b or 1t"],
        ["help", false, "For automatically upgrading Hacknet"]
    ]);
    const args = flags.args();
    ns.tprintf(`\n${flags.cmdLine()}`);
    const upgradeCycles = args["upgrade"];
    const scale = args["scale"];
    const max = args["max"];
    const moneyThreashhold = fromFormat(args["money"]);
    const nodes = HackNode.get(ns);
    const purchaser = new NodePurchaser(ns, scale, max, moneyThreashhold);
    const nodesNotMax = nodes.filter(n => n.isUpgradedMax == false);
    ns.tprintf(`Found ${nodes.length} node(s). ${nodesNotMax.length} can be upgraded. New nodes can be bought: ${purchaser.canBuyNode()}`);
    for (const node of nodes) {
        ns.print(`${node.idx}: Level: ${node.stats.level} RAM: ${asFormatGB(node.stats.ram)} Core: ${node.stats.cores} Upgradable: ${node.canUpgrade(purchaser.getAvailableMoney())}`);
    }
    ns.disableLog("ALL");
    if (upgradeCycles === 0) {
        while (true) {
            purchaser.upgradeNodes();
            await ns.sleep(10);
        }
    }
    else {
        for (let i = 0; i < upgradeCycles; i++) {
            purchaser.upgradeNodes();
            await ns.sleep(10);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS5qcyIsInNvdXJjZVJvb3QiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvc291cmNlcy8iLCJzb3VyY2VzIjpbIm5vZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUNsQyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDbkQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUduRDs7R0FFRztBQUNILE1BQU0sQ0FBQyxLQUFLLFVBQVUsSUFBSSxDQUFDLEVBQU87SUFDOUIsTUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsRUFBRSxFQUFFO1FBQzlCLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSx5Q0FBeUMsQ0FBQztRQUN6RCxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsa0VBQWtFLENBQUM7UUFDbEYsQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLDJDQUEyQyxDQUFDO1FBQ3hELENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSw4RkFBOEYsQ0FBQztRQUM3RyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUscUNBQXFDLENBQUM7S0FDdEQsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3ZCLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxLQUFLLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFBO0lBRWxDLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN0QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDNUIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3hCLE1BQU0sZ0JBQWdCLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBRW5ELE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDL0IsTUFBTSxTQUFTLEdBQUcsSUFBSSxhQUFhLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztJQUN0RSxNQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLGFBQWEsSUFBSSxLQUFLLENBQUMsQ0FBQztJQUVoRSxFQUFFLENBQUMsT0FBTyxDQUFDLFNBQVMsS0FBSyxDQUFDLE1BQU0sYUFBYSxXQUFXLENBQUMsTUFBTSw4Q0FBOEMsU0FBUyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUV2SSxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtRQUN0QixFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsWUFBWSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssU0FBUyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssZ0JBQWdCLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLGlCQUFpQixFQUFFLENBQUMsRUFBRSxDQUFDLENBQUE7S0FDakw7SUFFRCxFQUFFLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRXJCLElBQUksYUFBYSxLQUFLLENBQUMsRUFBRTtRQUNyQixPQUFNLElBQUksRUFBRTtZQUNSLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUN6QixNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDdEI7S0FDSjtTQUFNO1FBQ0gsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGFBQWEsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNwQyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDekIsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ3RCO0tBQ0o7QUFDTCxDQUFDIn0=