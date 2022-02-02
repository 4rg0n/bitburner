import { GangConfigGenerator } from '/gang/GangConfig';
import { Flags } from '/lib/Flags';
import { toPrintableString } from '/lib/utils';
export async function main(ns) {
    const flags = new Flags(ns, [
        ["hack", 0, `Amount of members, who would do hacking tasks. Total max: ${GangConfigGenerator.MaximumGangMembers}`],
        ["combat", 0, `Amount of members, who would do combat tasks. Total max: ${GangConfigGenerator.MaximumGangMembers}`],
        ["current", false, `Save current state into ${GangConfigGenerator.CurrentConfigPath}`],
        ["default", false, `Generates a default gang configuration at ${GangConfigGenerator.DefaultConfigPath}`],
        ["save", "", `Save generated config into given file path e.g. --save gang/gang.1337.json`],
        ["read", "", `Read config from file and print it`],
        ["help", false, "For managing gang configurations"]
    ]);
    const args = flags.args();
    const hackAmount = args["hack"];
    const combatAmount = args["combat"];
    const savePath = args["save"];
    const readPath = args["read"];
    const doDefault = args["default"];
    const doCurrent = args["current"];
    let gangConfig = undefined;
    if (doDefault) {
        gangConfig = GangConfigGenerator.generateGangConfig(ns, 6, 6);
        await GangConfigGenerator.write(ns, gangConfig, GangConfigGenerator.DefaultConfigPath);
        ns.tprintf(`INFO DEFAULT gang config saved to ${GangConfigGenerator.DefaultConfigPath}.txt`);
        return;
    }
    if (doCurrent) {
        gangConfig = GangConfigGenerator.fromCurrent(ns);
        await GangConfigGenerator.write(ns, gangConfig, GangConfigGenerator.DefaultConfigPath);
        ns.tprintf(`INFO CURRENT gang config saved to ${GangConfigGenerator.DefaultConfigPath}.txt`);
        return;
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FuZy1jZmcuanMiLCJzb3VyY2VSb290IjoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL3NvdXJjZXMvIiwic291cmNlcyI6WyJnYW5nLWNmZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsbUJBQW1CLEVBQWUsTUFBTSxrQkFBa0IsQ0FBQztBQUNwRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ25DLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUUvQyxNQUFNLENBQUMsS0FBSyxVQUFVLElBQUksQ0FBQyxFQUFPO0lBQzlCLE1BQU0sS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLEVBQUUsRUFBRTtRQUN4QixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsNkRBQTZELG1CQUFtQixDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDbEgsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLDREQUE0RCxtQkFBbUIsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQ25ILENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSwyQkFBMkIsbUJBQW1CLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUN0RixDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsNkNBQTZDLG1CQUFtQixDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDeEcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLDRFQUE0RSxDQUFDO1FBQzFGLENBQUMsTUFBTSxFQUFFLEVBQUUsRUFBRSxvQ0FBb0MsQ0FBQztRQUN4RCxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsa0NBQWtDLENBQUM7S0FDbkQsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO0lBRXZCLE1BQU0sVUFBVSxHQUFZLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN6QyxNQUFNLFlBQVksR0FBWSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDN0MsTUFBTSxRQUFRLEdBQVksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3ZDLE1BQU0sUUFBUSxHQUFZLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN2QyxNQUFNLFNBQVMsR0FBYSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDNUMsTUFBTSxTQUFTLEdBQWEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBRTVDLElBQUksVUFBVSxHQUErQixTQUFTLENBQUM7SUFFdkQsSUFBSSxTQUFTLEVBQUU7UUFDWCxVQUFVLEdBQUcsbUJBQW1CLENBQUMsa0JBQWtCLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUU5RCxNQUFNLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsVUFBVSxFQUFFLG1CQUFtQixDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDdkYsRUFBRSxDQUFDLE9BQU8sQ0FBQyxxQ0FBcUMsbUJBQW1CLENBQUMsaUJBQWlCLE1BQU0sQ0FBQyxDQUFDO1FBQzdGLE9BQU87S0FDVjtJQUVELElBQUksU0FBUyxFQUFFO1FBQ1gsVUFBVSxHQUFHLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUVqRCxNQUFNLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsVUFBVSxFQUFFLG1CQUFtQixDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDdkYsRUFBRSxDQUFDLE9BQU8sQ0FBQyxxQ0FBcUMsbUJBQW1CLENBQUMsaUJBQWlCLE1BQU0sQ0FBQyxDQUFDO1FBQzdGLE9BQU87S0FDVjtJQUVELElBQUksVUFBVSxHQUFHLENBQUMsSUFBSSxZQUFZLEdBQUcsQ0FBQyxFQUFFO1FBQ3BDLFVBQVUsR0FBRyxtQkFBbUIsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLEVBQUUsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDO0tBQ3JGO0lBRUQsSUFBSSxRQUFRLEtBQUssRUFBRSxFQUFFO1FBQ2pCLFVBQVUsR0FBRyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQ3ZEO0lBRUQsSUFBSSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLEVBQUU7UUFDNUIsRUFBRSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDckQ7U0FBTTtRQUNILEVBQUUsQ0FBQyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQztRQUMzQyxPQUFPO0tBQ1Y7SUFFRCxJQUFJLFFBQVEsS0FBSyxFQUFFLEVBQUU7UUFDakIsTUFBTSxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUMxRCxFQUFFLENBQUMsT0FBTyxDQUFDLDZCQUE2QixRQUFRLE1BQU0sQ0FBQyxDQUFDO0tBQzNEO0FBQ0wsQ0FBQyJ9