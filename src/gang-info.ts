
import { Flags } from "lib/Flags";
import { toPrintableString } from "lib/utils";
import { NS } from "@ns";
import { Chabo, Task } from "/gang/Chabo";
import { Equipment } from "/gang/Equipment";

/**
 * For showing various gang information
 */
 export async function main(ns : NS): Promise<void> {
    const flags = new Flags(ns, [
        ["...", [""], `Name(s) of gang member(s) to show info with via --chabo`],
        ["task", ["all"], `Show tasks information: ${Object.values(Task.Categories).join(", ")}`],
        ["equip", ["all"], `Show equipment information: ${ns.gang.getEquipmentNames().join(", ")}`],
        ["chabo", false, `Show chabos information: ${ns.gang.getMemberNames().join(", ")}`],
        ["gang", false, "Show gang information"],
		["help", false, "For showing various gang information"]
	]);
	const args = flags.args();

    const chaboNames : string[] = args._;
    const taskTypes : string[] = args["taskinfo"];
    const showChabo : boolean = args["chabo"];
    const equipNames : string[] = args["equipinfo"];
    const showGang : boolean = args["gang"];

    if (flags.isPresent("task")) {
        if (taskTypes.length > 0 && taskTypes[0] !== "all") {
            for (const type of taskTypes) {
                ns.tprintf(`${type}:\n`)
                Task.get(ns, type).forEach(task => ns.tprintf(`${toPrintableString(task.stats)}`))
            }
        } else {
            Task.get(ns).forEach(task => ns.tprintf(`${toPrintableString(task.stats)}`))
        }
        
        return;
    }

    if (showChabo) {
        if (chaboNames.length > 0 && chaboNames[0] !== "") {
            Chabo.get(ns).filter(c => {
                const matched = chaboNames.filter(name => c.name.toLowerCase().indexOf(name.toLowerCase()) !== -1);

                return matched.length > 0;
            }).forEach(chabo => {
                ns.tprintf(`${chabo.name}:\n`);
                ns.tprintf(`${toPrintableString(chabo.info)}`);
                ns.tprintf(`${toPrintableString(chabo.statsRaw)}`);
                ns.tprintf(`${toPrintableString(chabo.getAscensionResult())}`);
                ns.tprintf(`${toPrintableString(chabo.getMultiWeights())}`);
                ns.tprintf(`Noob: ${chabo.isNoob()}`);
                ns.tprintf(`Blank: ${chabo.isBlank()}`);
            })
        } else {
            Chabo.get(ns).forEach(chabo => {
                ns.tprintf(`${chabo.name}:\n`);
                ns.tprintf(`${toPrintableString(chabo.info)}`);
                ns.tprintf(`${toPrintableString(chabo.statsRaw)}`);
                ns.tprintf(`${toPrintableString(chabo.getAscensionResult())}`);
                ns.tprintf(`${toPrintableString(chabo.getMultiWeights())}`);
                ns.tprintf(`Noob: ${chabo.isNoob()}`);
                ns.tprintf(`Blank: ${chabo.isBlank()}`);
            });
        }
       
        return;
    }

    if (showGang) {
        ns.tprintf(`${toPrintableString(ns.gang.getGangInformation())}`);
        ns.tprintf(`${toPrintableString(ns.gang.getOtherGangInformation())}`);
        return;
    }

    if (flags.isPresent("equip")) {
        const equipments = Equipment.get(ns);

        if (equipNames.length > 0 && equipNames[0] !== "all") {
            for (const name of equipNames) {
                equipments.filter(e => e.name === name)
                    .forEach(e => ns.tprintf(`${e.name} (${e.type}):\n${toPrintableString(e.stats)}`))
            }
        } else {
            equipments.forEach(e => ns.tprintf(`${e.name} (${e.type}):\n${toPrintableString(e.stats)}`))
        }
        
        return;
    }
}

