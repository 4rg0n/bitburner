// @ts-check
/** @typedef {import(".").NS} NS */

import { Flags } from "./Flags.js";
import { HackNode, NodePurchaser } from "./NodePurchaser.js";
import { asFormatGB, fromFormat } from "./utils.js";

/**
 * For purchasing or upgrading servers
 * 
 * @param {NS} ns 
 */
export async function main(ns) {
    const flags = new Flags(ns, [
		["upgrade", 1, "Number of upgrade cycles. 0 is infinite"],
		["scale", 0.5, "How much of available money shall be used in percent from 0 to 1"],
		["max", 25, "How many nodes to buy max. 0 is infinite."],
		["money", "", "Will not go under this amount of money when purchasing. Can be formatted in: e.g. 100b or 1t"],
		["help", false, ""]
	]);
	const args = flags.args();
    ns.tprintf(`\n${flags.cmdLine()}`)

    const upgradeCycles = args["upgrade"];
    const scale = args["scale"];
    const max = args["max"];
    const moneyThreashhold = fromFormat(args["money"]);

    const nodes = HackNode.get(ns);
    const purchaser = new NodePurchaser(ns, scale, max, moneyThreashhold);
    const nodesNotMax = nodes.filter(n => n.isUpgradedMax == false);

    ns.tprintf(`Found ${nodes.length} node(s). ${nodesNotMax.length} can be upgraded.`);

    for (const node of nodes) {
        ns.tprintf(`${node.idx}: Level: ${node.stats.level} RAM: ${asFormatGB(node.stats.ram)} Core: ${node.stats.cores} Upgradable: ${node.canUpgrade(purchaser.getAvailableMoney())}`)
    }

    const prompt = await ns.prompt(`Do you want to proceed?`);

	if (!prompt) {
	 	return;
	}

    ns.disableLog("ALL");

    if (upgradeCycles === 0) {
        while(true) {
            purchaser.upgradeNodes(nodes);
            await ns.sleep(1000);
        }
    } else {
        for (let i = 0; i < upgradeCycles; i++) {
            purchaser.upgradeNodes(nodes);
            await ns.sleep(100);
        }
    }
}