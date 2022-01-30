import { Flags } from "lib/Flags";
import { asFormat, asFormatGB, fromFormatGB } from "lib/utils";
import { Purchaser } from "server/Purchaser";
/**
 * For purchasing or upgrading servers
 */
export async function main(ns) {
    const flags = new Flags(ns, [
        ["_", "8gb", "Amount of ram in GB to purchase"],
        ["max", false, "When given, the max possible amount of servers will be bought"],
        ["scale", 1, "Defines the percent between 0 and 1 to buy max possible amount of servers with"],
        ["multi", 2, "Multiplikator for next possible ram upgrade"],
        ["help", false, ""]
    ]);
    const args = flags.args();
    let ram = args._[0];
    const scale = args["scale"];
    const multi = args["multi"];
    const doMax = args["max"];
    const purchaser = new Purchaser(ns, scale, multi);
    if (doMax) {
        ram = purchaser.getRamMaxUpgrade();
    }
    else {
        ram = fromFormatGB(ram);
    }
    if (Number.isNaN(ram)) {
        throw "Invalid ram given";
    }
    ns.tprintf(`There are ${purchaser.getFreeSlots()} free server slots`);
    ns.tprintf(`Upgrade possible: ${purchaser.canUpgradeServers()}`);
    ns.tprintf(`Possible next upgrade could be from [min: ${asFormatGB(purchaser.getRamMin())}|max: ${asFormatGB(purchaser.getRamMax())}] to ${asFormatGB(purchaser.getRamMaxUpgrade())} for ${asFormat(purchaser.getUpgradeCosts())}`);
    const prompt = await ns.prompt(`Upgrading to ${doMax ? "MAX " : ""} ${asFormatGB(ram)} will cost you ${asFormat(purchaser.getCostTotal(ram))}`);
    if (!prompt) {
        return;
    }
    purchaser.buyServers(ram);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVyY2hhc2UuanMiLCJzb3VyY2VSb290IjoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL3NvdXJjZXMvIiwic291cmNlcyI6WyJwdXJjaGFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQ2xDLE9BQU8sRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUMvRCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFJN0M7O0dBRUc7QUFDSCxNQUFNLENBQUMsS0FBSyxVQUFVLElBQUksQ0FBQyxFQUFPO0lBQ2pDLE1BQU0sS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLEVBQUUsRUFBRTtRQUMzQixDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsaUNBQWlDLENBQUM7UUFDL0MsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLCtEQUErRCxDQUFDO1FBQy9FLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxnRkFBZ0YsQ0FBQztRQUM5RixDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsNkNBQTZDLENBQUM7UUFDM0QsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQztLQUNuQixDQUFDLENBQUM7SUFDSCxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7SUFFMUIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNwQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDNUIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzVCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUUxQixNQUFNLFNBQVMsR0FBRyxJQUFJLFNBQVMsQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBRWxELElBQUksS0FBSyxFQUFFO1FBQ1YsR0FBRyxHQUFHLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0tBQ25DO1NBQU07UUFDTixHQUFHLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ3hCO0lBRUQsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQ3RCLE1BQU0sbUJBQW1CLENBQUM7S0FDMUI7SUFFRCxFQUFFLENBQUMsT0FBTyxDQUFDLGFBQWEsU0FBUyxDQUFDLFlBQVksRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO0lBQ3RFLEVBQUUsQ0FBQyxPQUFPLENBQUMscUJBQXFCLFNBQVMsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUNoRSxFQUFFLENBQUMsT0FBTyxDQUFDLDZDQUE2QyxVQUFVLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFDLFNBQVMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxRQUFRLFVBQVUsQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxRQUFRLFFBQVEsQ0FBQyxTQUFTLENBQUMsZUFBZSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFcE8sTUFBTSxNQUFNLEdBQUcsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLGdCQUFnQixLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLFFBQVEsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRWhKLElBQUksQ0FBQyxNQUFNLEVBQUU7UUFDWixPQUFPO0tBQ1A7SUFFRCxTQUFTLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzNCLENBQUMifQ==