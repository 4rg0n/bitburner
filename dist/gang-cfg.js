import { GangConfigGenerator } from '/gang/GangConfig';
import { Flags } from '/lib/Flags';
import { toPrintableString } from '/lib/utils';
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
        ns.tprintf(toPrintableString(gangConfig, ["ns"]));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FuZy1jZmcuanMiLCJzb3VyY2VSb290IjoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL3NvdXJjZXMvIiwic291cmNlcyI6WyJnYW5nLWNmZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsbUJBQW1CLEVBQWUsTUFBTSxrQkFBa0IsQ0FBQztBQUNwRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ25DLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUUvQyxNQUFNLENBQUMsS0FBSyxVQUFVLElBQUksQ0FBQyxFQUFPO0lBQzlCLE1BQU0sS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLEVBQUUsRUFBRTtRQUN4QixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsNkVBQTZFLG1CQUFtQixDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDbEksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLDRFQUE0RSxtQkFBbUIsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQ25JLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSwyQkFBMkIsbUJBQW1CLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUN0RixDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsNkNBQTZDLG1CQUFtQixDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDeEcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLDJGQUEyRixDQUFDO1FBQ3pHLENBQUMsTUFBTSxFQUFFLEVBQUUsRUFBRSx5Q0FBeUMsQ0FBQztRQUN2RCxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsZ0NBQWdDLENBQUM7UUFDL0MsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLDRCQUE0QixDQUFDO1FBQ2pELENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxrQ0FBa0MsQ0FBQztLQUNuRCxDQUFDLENBQUM7SUFDSCxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7SUFFdkIsTUFBTSxV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