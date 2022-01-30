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
        ["help", false, ""]
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
        ns.tprintf(`${node.idx}: Level: ${node.stats.level} RAM: ${asFormatGB(node.stats.ram)} Core: ${node.stats.cores} Upgradable: ${node.canUpgrade(purchaser.getAvailableMoney())}`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS5qcyIsInNvdXJjZVJvb3QiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvc291cmNlcy8iLCJzb3VyY2VzIjpbIm5vZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUNsQyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDbkQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUduRDs7R0FFRztBQUNILE1BQU0sQ0FBQyxLQUFLLFVBQVUsSUFBSSxDQUFDLEVBQU87SUFDOUIsTUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsRUFBRSxFQUFFO1FBQzlCLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSx5Q0FBeUMsQ0FBQztRQUN6RCxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsa0VBQWtFLENBQUM7UUFDbEYsQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLDJDQUEyQyxDQUFDO1FBQ3hELENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSw4RkFBOEYsQ0FBQztRQUM3RyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDO0tBQ25CLENBQUMsQ0FBQztJQUNILE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN2QixFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssS0FBSyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUVsQyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDdEMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzVCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN4QixNQUFNLGdCQUFnQixHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUVuRCxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQy9CLE1BQU0sU0FBUyxHQUFHLElBQUksYUFBYSxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLGdCQUFnQixDQUFDLENBQUM7SUFDdEUsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxhQUFhLElBQUksS0FBSyxDQUFDLENBQUM7SUFFaEUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEtBQUssQ0FBQyxNQUFNLGFBQWEsV0FBVyxDQUFDLE1BQU0sOENBQThDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFdkksS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUU7UUFDdEIsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLFlBQVksSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLFNBQVMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLGdCQUFnQixJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0tBQ25MO0lBRUQsRUFBRSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUVyQixJQUFJLGFBQWEsS0FBSyxDQUFDLEVBQUU7UUFDckIsT0FBTSxJQUFJLEVBQUU7WUFDUixTQUFTLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDekIsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ3RCO0tBQ0o7U0FBTTtRQUNILEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxhQUFhLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDcEMsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ3pCLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUN0QjtLQUNKO0FBQ0wsQ0FBQyJ9