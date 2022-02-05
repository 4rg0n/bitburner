import { GangConfigGenerator } from '/gang/GangConfig';
import { Flags } from '/lib/Flags';
import { canRunGang } from '/lib/ns0';
import { toPrintableJson } from '/lib/utils';
export async function main(ns) {
    canRunGang(ns);
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
        const path = await GangConfigGenerator.writeDefault(ns);
        ns.tprintf(`INFO DEFAULT gang config saved to:\n nano ${path}`);
        return;
    }
    if (doCurrent) {
        const path = await GangConfigGenerator.writeCurrent(ns);
        ns.tprintf(`INFO CURRENT gang config saved to:\n nano ${path}`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FuZy1jZmcuanMiLCJzb3VyY2VSb290IjoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL3NvdXJjZXMvIiwic291cmNlcyI6WyJnYW5nLWNmZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsbUJBQW1CLEVBQWUsTUFBTSxrQkFBa0IsQ0FBQztBQUNwRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ25DLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDdEMsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUU3QyxNQUFNLENBQUMsS0FBSyxVQUFVLElBQUksQ0FBQyxFQUFPO0lBQzlCLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNmLE1BQU0sS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLEVBQUUsRUFBRTtRQUN4QixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsNkVBQTZFLG1CQUFtQixDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDbEksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLDRFQUE0RSxtQkFBbUIsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQ25JLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSwyQkFBMkIsbUJBQW1CLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUN0RixDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsNkNBQTZDLG1CQUFtQixDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDeEcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLDJGQUEyRixDQUFDO1FBQ3pHLENBQUMsTUFBTSxFQUFFLEVBQUUsRUFBRSx5Q0FBeUMsQ0FBQztRQUN2RCxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsZ0NBQWdDLENBQUM7UUFDL0MsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLDRCQUE0QixDQUFDO1FBQ2pELENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxrQ0FBa0MsQ0FBQztLQUNu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