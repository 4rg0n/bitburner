import { Flags } from "lib/Flags";
import { NodePurchaser } from "node/NodePurchaser";
import { HackNode } from "node/HackNode";
import { asFormatGB, fromFormat } from "lib/utils";
import { NS } from "@ns";

/**
 * For purchasing or upgrading servers
 */
export async function main(ns : NS): Promise<void>  {
    const flags = new Flags(ns, [
		["upgrade", 0, "Number of upgrade cycles. 0 is infinite"],
		["max", 20, "How many nodes to buy max. 0 is infinite."],
		["money", "", "Will not go under this amount of money when purchasing. Can be formatted in: e.g. 100b or 1t"],
		["help", false, "For automatically upgrading Hacknet"]
	]);
	const args = flags.args();
    ns.tprintf(`\n${flags.cmdLine()}`)

    const upgradeCycles = args["upgrade"];
    const max = args["max"];
    const moneyThreashhold = fromFormat(args["money"]);

    const nodes = HackNode.get(ns);
    const purchaser = new NodePurchaser(ns, max, moneyThreashhold);
    const nodesNotMax = nodes.filter(n => n.isUpgradedMax == false);

    ns.tprintf(`Found ${nodes.length} node(s). ${nodesNotMax.length} can be upgraded. New nodes can be bought: ${purchaser.canBuyNode()}`);

    for (const node of nodes) {
        ns.print(`${node.idx}: Level: ${node.stats.level} RAM: ${asFormatGB(node.stats.ram)} Core: ${node.stats.cores} Upgradable: ${node.canUpgrade(purchaser.getAvailableMoney())}`)
    }

    ns.disableLog("ALL");

    if (upgradeCycles === 0) {
        while(true) {
            purchaser.upgradeNodes();
            await ns.sleep(10);
        }
    } else {
        for (let i = 0; i < upgradeCycles; i++) {
            purchaser.upgradeNodes();
            await ns.sleep(10);
        }
    }
}