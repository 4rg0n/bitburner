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
        ["max", 20, "How many nodes to buy max. 0 is infinite."],
        ["money", "", "Will not go under this amount of money when purchasing. Can be formatted in: e.g. 100b or 1t"],
        ["help", false, "For automatically upgrading Hacknet"]
    ]);
    const args = flags.args();
    ns.tprintf(`\n${flags.cmdLine()}`);
    const upgradeCycles = args["upgrade"];
    const max = args["max"];
    const moneyThreashhold = fromFormat(args["money"]);
    const nodes = HackNode.get(ns);
    const purchaser = new NodePurchaser(ns, max, moneyThreashhold);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS5qcyIsInNvdXJjZVJvb3QiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvc291cmNlcy8iLCJzb3VyY2VzIjpbIm5vZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUNsQyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDbkQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUduRDs7R0FFRztBQUNILE1BQU0sQ0FBQyxLQUFLLFVBQVUsSUFBSSxDQUFDLEVBQU87SUFDOUIsTUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsRUFBRSxFQUFFO1FBQzlCLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSx5Q0FBeUMsQ0FBQztRQUN6RCxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsMkNBQTJDLENBQUM7UUFDeEQsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLDhGQUE4RixDQUFDO1FBQzdHLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxxQ0FBcUMsQ0FBQztLQUN0RCxDQUFDLENBQUM7SUFDSCxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDdkIsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEtBQUssQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFFbEMsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3RDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN4QixNQUFNLGdCQUFnQixHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUVuRCxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQy9CLE1BQU0sU0FBUyxHQUFHLElBQUksYUFBYSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztJQUMvRCxNQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLGFBQWEsSUFBSSxLQUFLLENBQUMsQ0FBQztJQUVoRSxFQUFFLENBQUMsT0FBTyxDQUFDLFNBQVMsS0FBSyxDQUFDLE1BQU0sYUFBYSxXQUFXLENBQUMsTUFBTSw4Q0FBOEMsU0FBUyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUV2SSxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtRQUN0QixFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsWUFBWSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssU0FBUyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssZ0JBQWdCLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLGlCQUFpQixFQUFFLENBQUMsRUFBRSxDQUFDLENBQUE7S0FDakw7SUFFRCxFQUFFLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRXJCLElBQUksYUFBYSxLQUFLLENBQUMsRUFBRTtRQUNyQixPQUFNLElBQUksRUFBRTtZQUNSLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUN6QixNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDdEI7S0FDSjtTQUFNO1FBQ0gsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGFBQWEsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNwQyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDekIsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ3RCO0tBQ0o7QUFDTCxDQUFDIn0=