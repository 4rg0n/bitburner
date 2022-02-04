import { Flags } from "lib/Flags";
import { toPrintableJson } from "lib/utils";
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
        ns.tprintf(`${filterKeys[0]}: ${toPrintableJson(player[filterKeys[0]])}\n`);
    }
    else if (filterKeys.length > 1) {
        // display multiple keys
        for (const filterKey of filterKeys) {
            ns.tprintf(`${filterKey}: ${toPrintableJson(player[filterKey])}\n`);
        }
    }
    else {
        // display everything
        ns.tprintf(`${toPrintableJson(player)}`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWUuanMiLCJzb3VyY2VSb290IjoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL3NvdXJjZXMvIiwic291cmNlcyI6WyJtZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQ2xDLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFFNUM7O0dBRUc7QUFDRixNQUFNLENBQUMsS0FBSyxVQUFVLElBQUksQ0FBQyxFQUFPO0lBQy9CLE1BQU0sS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLEVBQUUsRUFBRTtRQUN4QixDQUFDLFFBQVEsRUFBRSxFQUFFLEVBQUUsK0JBQStCLENBQUM7UUFDckQsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLHdDQUF3QyxDQUFDO0tBQ3pELENBQUMsQ0FBQztJQUNILE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN2Qix1QkFBdUI7SUFDdkIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRWxDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDNUIsQ0FBQztBQUVBLFNBQVMsT0FBTyxDQUFDLEVBQU8sRUFBRSxhQUF3QixFQUFFO0lBQzdDLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUM5Qiw2REFBNkQ7SUFDN0QsYUFBYTtJQUNiLE1BQU0sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBQ2pCLDZEQUE2RDtJQUM3RCxhQUFhO0lBQ2IsTUFBTSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsbUJBQW1CO0lBRXBELElBQUksVUFBVSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7UUFDekIscUJBQXFCO1FBQ3JCLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUssZUFBZSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFpQixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDL0Y7U0FBTSxJQUFJLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQzlCLHdCQUF3QjtRQUN4QixLQUFLLE1BQU0sU0FBUyxJQUFJLFVBQVUsRUFBRTtZQUNoQyxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsU0FBUyxLQUFLLGVBQWUsQ0FBQyxNQUFNLENBQUMsU0FBeUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3ZGO0tBQ0o7U0FBTTtRQUNILHFCQUFxQjtRQUNyQixFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsZUFBZSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUM1QztBQUNULENBQUMifQ==