import { NS } from '@ns'
import { GangConfigGenerator, IGangConfig } from '/gang/GangConfig';
import { Flags } from '/lib/Flags';
import { toPrintableString } from '/lib/utils';

export async function main(ns : NS) : Promise<void> {
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

    const hackAmount : number = args["hack"];
    const combatAmount : number = args["combat"];
    const savePath : string = args["save"];
    const readPath : string = args["read"];
    const doDefault : boolean = args["default"];
    const doCurrent : boolean = args["current"];

    let gangConfig : IGangConfig[] | undefined = undefined;

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
    } else {
        ns.tprintf("INFO No gang config to print");
        return;
    }

    if (savePath !== "") {
        await GangConfigGenerator.write(ns, gangConfig, savePath);
        ns.tprintf(`INFO Gang config saved to ${savePath}.txt`);
    }  
}