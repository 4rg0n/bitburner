import { NS } from '@ns'
import { GangConfigGenerator, IGangConfig } from '/gang/GangConfig';
import { Flags } from '/lib/Flags';
import { canRunGang } from '/lib/ns0';
import { toPrintableJson } from '/lib/utils';

export async function main(ns : NS) : Promise<void> {
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

    const hackAmount : number = args["hack"];
    const combatAmount : number = args["combat"];
    const saveAlias : string = args["save"];
    const readPath : string = args["path"];
    const alias : string = args["alias"];
    const doDefault : boolean = args["default"];
    const doCurrent : boolean = args["current"];
    const doList : boolean = args["ls"];

    let gangConfig : IGangConfig[] | undefined = undefined;

    if (doList) {
        const configs = GangConfigGenerator.ls(ns);
        ns.tprintf(`Found ${configs.length} config(s):\n${configs.join("\n")}`);
        return;
    }

    if (doDefault) {
        if (ns.ls(ns.getHostname(), GangConfigGenerator.DefaultConfigPath)) {
            if (!await ns.prompt(`There's already a default config ${GangConfigGenerator.DefaultConfigPath}. Overwrite?`)) return;
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
    } else if (alias !== "") {
        gangConfig = GangConfigGenerator.readAlias(ns, alias);
    }
    
    if (!_.isUndefined(gangConfig)) {
        ns.tprintf(toPrintableJson(gangConfig, ["ns"]));
    } else {
        ns.tprintf("INFO No gang config to print");
        return;
    }

    if (saveAlias !== "") {
        if (ns.ls(ns.getHostname(), saveAlias)) {
            if (!await ns.prompt(`There's already a config ${saveAlias}. Overwrite?`)) return;
        }

        await GangConfigGenerator.writeAlias(ns, gangConfig, saveAlias);
        ns.tprintf(`INFO Gang config saved to:\n nano ${saveAlias}.txt`);
    }  
}

