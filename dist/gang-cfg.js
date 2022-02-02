import { GangConfigGenerator } from '/gang/GangConfig';
import { Flags } from '/lib/Flags';
import { toPrintableString } from '/lib/utils';
export async function main(ns) {
    const flags = new Flags(ns, [
        ["hack", 0, `Amount of members, who would do hacking tasks. Total max: ${GangConfigGenerator.MaximumGangMembers}`],
        ["combat", 0, `Amount of members, who would do combat tasks. Total max: ${GangConfigGenerator.MaximumGangMembers}`],
        ["save", "", `Save generated config into file`],
        ["read", "", `Read config from file and print it`],
        ["help", false, "For managing gang configurations"]
    ]);
    const args = flags.args();
    const hackAmount = args["hack"];
    const combatAmount = args["combat"];
    const savePath = args["save"];
    const readPath = args["read"];
    let gangConfig = undefined;
    if (hackAmount > 0 || combatAmount > 0) {
        gangConfig = GangConfigGenerator.generateGangConfig(ns, hackAmount, combatAmount);
    }
    if (readPath !== "") {
        gangConfig = GangConfigGenerator.read(ns, readPath);
    }
    if (!_.isUndefined(gangConfig)) {
        ns.tprintf(toPrintableString(gangConfig, ["ns"]));
    }
    else {
        ns.tprintf("INFO No gang config to print");
        return;
    }
    if (savePath !== "") {
        await GangConfigGenerator.write(ns, gangConfig, savePath);
        ns.tprintf(`INFO Gang config saved to ${savePath}.txt`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FuZy1jZmcuanMiLCJzb3VyY2VSb290IjoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL3NvdXJjZXMvIiwic291cmNlcyI6WyJnYW5nLWNmZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsbUJBQW1CLEVBQWUsTUFBTSxrQkFBa0IsQ0FBQztBQUNwRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ25DLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUUvQyxNQUFNLENBQUMsS0FBSyxVQUFVLElBQUksQ0FBQyxFQUFPO0lBQzlCLE1BQU0sS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLEVBQUUsRUFBRTtRQUN4QixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsNkRBQTZELG1CQUFtQixDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDbEgsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLDREQUE0RCxtQkFBbUIsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQ25ILENBQUMsTUFBTSxFQUFFLEVBQUUsRUFBRSxpQ0FBaUMsQ0FBQztRQUMvQyxDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsb0NBQW9DLENBQUM7UUFDeEQsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLGtDQUFrQyxDQUFDO0tBQ25ELENBQUMsQ0FBQztJQUNILE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUV2QixNQUFNLFVBQVUsR0FBWSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDekMsTUFBTSxZQUFZLEdBQVksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzdDLE1BQU0sUUFBUSxHQUFZLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN2QyxNQUFNLFFBQVEsR0FBWSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFdkMsSUFBSSxVQUFVLEdBQStCLFNBQVMsQ0FBQztJQUV2RCxJQUFJLFVBQVUsR0FBRyxDQUFDLElBQUksWUFBWSxHQUFHLENBQUMsRUFBRTtRQUNwQyxVQUFVLEdBQUcsbUJBQW1CLENBQUMsa0JBQWtCLENBQUMsRUFBRSxFQUFFLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQztLQUNyRjtJQUVELElBQUksUUFBUSxLQUFLLEVBQUUsRUFBRTtRQUNqQixVQUFVLEdBQUcsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQztLQUN2RDtJQUVELElBQUksQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxFQUFFO1FBQzVCLEVBQUUsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsVUFBVSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ3JEO1NBQU07UUFDSCxFQUFFLENBQUMsT0FBTyxDQUFDLDhCQUE4QixDQUFDLENBQUM7UUFDM0MsT0FBTztLQUNWO0lBRUQsSUFBSSxRQUFRLEtBQUssRUFBRSxFQUFFO1FBQ2pCLE1BQU0sbUJBQW1CLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDMUQsRUFBRSxDQUFDLE9BQU8sQ0FBQyw2QkFBNkIsUUFBUSxNQUFNLENBQUMsQ0FBQztLQUMzRDtBQUNMLENBQUMifQ==