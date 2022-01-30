import { Flags } from "lib/Flags";
import { toPrintableString } from "lib/utils";
/**
 * For displaying player information
 */
export async function main(ns) {
    const flags = new Flags(ns, [
        ["filter", [], "Only show certain information"],
        ["help", false, "Will show information about the player"]
    ]);
    const args = flags.args();
    /** @type {string[]} */
    const filterKeys = args["filter"];
    display(ns, filterKeys);
}
function display(ns, filterKeys = []) {
    const player = ns.getPlayer();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    player.karma = 0;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    player.karma = ns.heart.break(); // undocumented api
    if (filterKeys.length === 1) {
        // display single key
        ns.tprintf(`${filterKeys[0]}: ${toPrintableString(player[filterKeys[0]])}\n`);
    }
    else if (filterKeys.length > 1) {
        // display multiple keys
        for (const filterKey of filterKeys) {
            ns.tprintf(`${filterKey}: ${toPrintableString(player[filterKey])}\n`);
        }
    }
    else {
        // display everything
        ns.tprintf(`${toPrintableString(player)}`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWUuanMiLCJzb3VyY2VSb290IjoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL3NvdXJjZXMvIiwic291cmNlcyI6WyJtZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQ2xDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUU5Qzs7R0FFRztBQUNGLE1BQU0sQ0FBQyxLQUFLLFVBQVUsSUFBSSxDQUFDLEVBQU87SUFDL0IsTUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsRUFBRSxFQUFFO1FBQ3hCLENBQUMsUUFBUSxFQUFFLEVBQUUsRUFBRSwrQkFBK0IsQ0FBQztRQUNyRCxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsd0NBQXdDLENBQUM7S0FDekQsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3ZCLHVCQUF1QjtJQUN2QixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFbEMsT0FBTyxDQUFDLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUM1QixDQUFDO0FBRUEsU0FBUyxPQUFPLENBQUMsRUFBTyxFQUFFLGFBQXdCLEVBQUU7SUFDN0MsTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQzlCLDZEQUE2RDtJQUM3RCxhQUFhO0lBQ2IsTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7SUFDakIsNkRBQTZEO0lBQzdELGFBQWE7SUFDYixNQUFNLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxtQkFBbUI7SUFFcEQsSUFBSSxVQUFVLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUN6QixxQkFBcUI7UUFDckIsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBSyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBaUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ2pHO1NBQU0sSUFBSSxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtRQUM5Qix3QkFBd0I7UUFDeEIsS0FBSyxNQUFNLFNBQVMsSUFBSSxVQUFVLEVBQUU7WUFDaEMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLFNBQVMsS0FBSyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsU0FBeUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3pGO0tBQ0o7U0FBTTtRQUNILHFCQUFxQjtRQUNyQixFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsaUJBQWlCLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQzlDO0FBQ1QsQ0FBQyJ9