import { GangConfigGenerator } from '/gang/GangConfig';
import { Flags } from '/lib/Flags';
import { toPrintableJson } from '/lib/utils';
export async function main(ns) {
    const flags = new Flags(ns, [
        ["hack", 0, `Amount of members, who would do hacking tasks. Total combat and hack max: ${GangConfigGenerator.MaximumGangMembers}`],
        ["combat", 0, `Amount of members, who would do combat tasks. Total combat and hack max: ${GangConfigGenerator.MaximumGangMembers}`],
        ["current", false, `Save current state into ${GangConfigGenerator.CurrentConfigPath}`],
        ["default", false, `Generates a default gang configuration at ${GangConfigGenerator.DefaultConfigPath}`],
        ["save", "", `Save generated config with given alias e.g. --save 1337 will be config/gang/gang.1337.txt`],
        ["path", "", `Read config from file path and print it`],
        ["alias", "", `Read config via alias print it`],
        ["ls", false, `List all available configs`],
        ["help", false, "For managing gang configurations"]
    ]);
    const args = flags.args();
    const hackAmount = args["hack"];
    const combatAmount = args["combat"];
    const saveAlias = args["save"];
    const readPath = args["path"];
    const alias = args["alias"];
    const doDefault = args["default"];
    const doCurrent = args["current"];
    const doList = args["ls"];
    let gangConfig = undefined;
    if (doList) {
        const configs = GangConfigGenerator.ls(ns);
        ns.tprintf(`Found ${configs.length} config(s):\n${configs.join("\n")}`);
        return;
    }
    if (doDefault) {
        if (ns.ls(ns.getHostname(), GangConfigGenerator.DefaultConfigPath)) {
            if (!await ns.prompt(`There's already a default config ${GangConfigGenerator.DefaultConfigPath}. Overwrite?`))
                return;
        }
        gangConfig = GangConfigGenerator.generateGangConfig(ns, 6, 6);
        await GangConfigGenerator.write(ns, gangConfig, GangConfigGenerator.DefaultConfigPath);
        ns.tprintf(`INFO DEFAULT gang config saved to:\n nano ${GangConfigGenerator.DefaultConfigPath}.txt`);
        return;
    }
    if (doCurrent) {
        gangConfig = GangConfigGenerator.fromCurrent(ns);
        await GangConfigGenerator.write(ns, gangConfig, GangConfigGenerator.DefaultConfigPath);
        ns.tprintf(`INFO CURRENT gang config saved to:\n nano ${GangConfigGenerator.DefaultConfigPath}.txt`);
        return;
    }
    if (hackAmount > 0 || combatAmount > 0) {
        gangConfig = GangConfigGenerator.generateGangConfig(ns, hackAmount, combatAmount);
    }
    if (readPath !== "") {
        gangConfig = GangConfigGenerator.read(ns, readPath);
    }
    else if (alias !== "") {
        gangConfig = GangConfigGenerator.readAlias(ns, alias);
    }
    if (!_.isUndefined(gangConfig)) {
        ns.tprintf(toPrintableJson(gangConfig, ["ns"]));
    }
    else {
        ns.tprintf("INFO No gang config to print");
        return;
    }
    if (saveAlias !== "") {
        if (ns.ls(ns.getHostname(), saveAlias)) {
            if (!await ns.prompt(`There's already a config ${saveAlias}. Overwrite?`))
                return;
        }
        await GangConfigGenerator.writeAlias(ns, gangConfig, saveAlias);
        ns.tprintf(`INFO Gang config saved to:\n nano ${saveAlias}.txt`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FuZy1jZmcuanMiLCJzb3VyY2VSb290IjoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL3NvdXJjZXMvIiwic291cmNlcyI6WyJnYW5nLWNmZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsbUJBQW1CLEVBQWUsTUFBTSxrQkFBa0IsQ0FBQztBQUNwRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ25DLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFN0MsTUFBTSxDQUFDLEtBQUssVUFBVSxJQUFJLENBQUMsRUFBTztJQUM5QixNQUFNLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxFQUFFLEVBQUU7UUFDeEIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLDZFQUE2RSxtQkFBbUIsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQ2xJLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSw0RUFBNEUsbUJBQW1CLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUNuSSxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsMkJBQTJCLG1CQUFtQixDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDdEYsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLDZDQUE2QyxtQkFBbUIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQ3hHLENBQUMsTUFBTSxFQUFFLEVBQUUsRUFBRSwyRkFBMkYsQ0FBQztRQUN6RyxDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUseUNBQXlDLENBQUM7UUFDdkQsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLGdDQUFnQyxDQUFDO1FBQy9DLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSw0QkFBNEIsQ0FBQztRQUNqRCxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsa0NBQWtDLENBQUM7S0FDbkQsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO0lBRXZCLE1BQU0sVUFBVSxHQUFZLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN6QyxNQUFNLFlBQVksR0FBWSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDN0MsTUFBTSxTQUFTLEdBQVksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3hDLE1BQU0sUUFBUSxHQUFZLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN2QyxNQUFNLEtBQUssR0FBWSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDckMsTUFBTSxTQUFTLEdBQWEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzVDLE1BQU0sU0FBUyxHQUFhLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUM1QyxNQUFNLE1BQU0sR0FBYSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFcEMsSUFBSSxVQUFVLEdBQStCLFNBQVMsQ0FBQztJQUV2RCxJQUFJLE1BQU0sRUFBRTtRQUNSLE1BQU0sT0FBTyxHQUFHLG1CQUFtQixDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMzQyxFQUFFLENBQUMsT0FBTyxDQUFDLFNBQVMsT0FBTyxDQUFDLE1BQU0sZ0JBQWdCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3hFLE9BQU87S0FDVjtJQUVELElBQUksU0FBUyxFQUFFO1FBQ1gsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsRUFBRSxtQkFBbUIsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFO1lBQ2hFLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsb0NBQW9DLG1CQUFtQixDQUFDLGlCQUFpQixjQUFjLENBQUM7Z0JBQUUsT0FBTztTQUN6SDtRQUVELFVBQVUsR0FBRyxtQkFBbUIsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRTlELE1BQU0sbUJBQW1CLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxVQUFVLEVBQUUsbUJBQW1CLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUN2RixFQUFFLENBQUMsT0FBTyxDQUFDLDZDQUE2QyxtQkFBbUIsQ0FBQyxpQkFBaUIsTUFBTSxDQUFDLENBQUM7UUFDckcsT0FBTztLQUNWO0lBRUQsSUFBSSxTQUFTLEVBQUU7UUFDWCxVQUFVLEdBQUcsbUJBQW1CLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRWpELE1BQU0sbUJBQW1CLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxVQUFVLEVBQUUsbUJBQW1CLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUN2RixFQUFFLENBQUMsT0FBTyxDQUFDLDZDQUE2QyxtQkFBbUIsQ0FBQyxpQkFBaUIsTUFBTSxDQUFDLENBQUM7UUFDckcsT0FBTztLQUNWO0lBRUQsSUFBSSxVQUFVLEdBQUcsQ0FBQyxJQUFJLFlBQVksR0FBRyxDQUFDLEVBQUU7UUFDcEMsVUFBVSxHQUFHLG1CQUFtQixDQUFDLGtCQUFrQixDQUFDLEVBQUUsRUFBRSxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUM7S0FDckY7SUFFRCxJQUFJLFFBQVEsS0FBSyxFQUFFLEVBQUU7UUFDakIsVUFBVSxHQUFHLG1CQUFtQixDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDdkQ7U0FBTSxJQUFJLEtBQUssS0FBSyxFQUFFLEVBQUU7UUFDckIsVUFBVSxHQUFHLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDekQ7SUFFRCxJQUFJLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsRUFBRTtRQUM1QixFQUFFLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDbkQ7U0FBTTtRQUNILEVBQUUsQ0FBQyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQztRQUMzQyxPQUFPO0tBQ1Y7SUFFRCxJQUFJLFNBQVMsS0FBSyxFQUFFLEVBQUU7UUFDbEIsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsRUFBRSxTQUFTLENBQUMsRUFBRTtZQUNwQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLDRCQUE0QixTQUFTLGNBQWMsQ0FBQztnQkFBRSxPQUFPO1NBQ3JGO1FBRUQsTUFBTSxtQkFBbUIsQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLFVBQVUsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNoRSxFQUFFLENBQUMsT0FBTyxDQUFDLHFDQUFxQyxTQUFTLE1BQU0sQ0FBQyxDQUFDO0tBQ3BFO0FBQ0wsQ0FBQyJ9