
import { Flags } from "lib/Flags";
import { toPrintableJson } from "lib/utils";
import { NS } from "@ns";
import { Chabo } from "/gang/Chabo";
import { Equipment } from "/gang/Equipment";
import { canRunGang } from '/lib/ns0';
import { Task } from '/gang/Task';

/**
 * For showing various gang information
 */
 export async function main(ns : NS): Promise<void> {
    canRunGang(ns);
    const flags = new Flags(ns, [
        ["...", [], `Name(s) of gang member(s) to show info with via --chabo`],
        ["task", ["all"], `Show tasks information: ${Object.values(Task.Categories).join(", ")}`],
        ["equip", ["all"], `Show equipment information: ${ns.gang.getEquipmentNames().join(", ")}`],
        ["chabo", false, `Show chabos information: ${ns.gang.getMemberNames().join(", ")}`],
        ["gang", false, "Show gang information"],
		["help", false, "For showing various gang information"]
	]);
	const args = flags.args();

    const chaboNames : string[] = args._;
    const taskTypes : string[] = args["task"];
    const showChabo : boolean = args["chabo"];
    const equipNames : string[] = args["equip"];
    const showGang : boolean = args["gang"];

    if (flags.isPresent("task")) {
        if (taskTypes.length > 0 && taskTypes[0] !== "all") {
            for (const type of taskTypes) {
                const tasks = Task.get(ns, type);

                tasks.forEach(task => ns.tprintf(`• ${task.name}:\n${toPrintableJson(task.stats)}`));
                ns.tprintf(`Found ${tasks.length} task(s) of type ${type}`);
            }
        } else {
            const tasks = Task.get(ns);
            tasks.forEach(task => ns.tprintf(`${toPrintableJson(task.stats)}`));
            ns.tprintf(`Found(${tasks.length} task(s)`);
        }
        
        return;
    }

    if (showChabo) {
        if (chaboNames.length > 0 && chaboNames[0] !== "") {
            Chabo.get(ns).filter(c => {
                const matched = chaboNames.filter(name => c.name.toLowerCase().indexOf(name.toLowerCase()) !== -1);

                return matched.length > 0;
            }).forEach(chabo => {
                printChabo(ns, chabo);
            })
        } else {
            Chabo.get(ns).forEach(chabo => {
               printChabo(ns, chabo);
            });
        }
       
        return;
    }

    if (showGang) {
        ns.tprintf(`${toPrintableJson(ns.gang.getGangInformation())}`);
        ns.tprintf(`${toPrintableJson(ns.gang.getOtherGangInformation())}`);
        return;
    }

    if (flags.isPresent("equip")) {
        const equipments = Equipment.get(ns);

        if (equipNames.length > 0 && equipNames[0] !== "all") {
            for (const name of equipNames) {
                const equsByName = equipments.filter(e => e.name === name);
                equsByName.forEach(e => ns.tprintf(`• ${e.name} (${e.type}):\n${toPrintableJson(e.stats)}`));

                ns.tprintf(`Found ${equsByName.length} equipment(s) with ${name} in it`);
            }
        } else {
            equipments.forEach(e => ns.tprintf(`${e.name} (${e.type}):\n${toPrintableJson(e.stats)}`));
            ns.tprintf(`Found ${equipments.length} equipment(s) with ${name} in it`);
        }
        
        return;
    }
}

function printChabo(ns: NS, chabo : Chabo) : void {
    ns.tprintf(`${chabo.name}:\n`);
    ns.tprintf(`• info:\n${toPrintableJson(chabo.info)}`);
    ns.tprintf(`• statsRaw:\n${toPrintableJson(chabo.statsRaw)}`);
    ns.tprintf(`• ascResult:\n${toPrintableJson(chabo.getAscResult())}`);
    ns.tprintf(`• statMultiWeights:\n${toPrintableJson(chabo.getMultiWeights())}`);
    ns.tprintf(`• statAscMultiWeights:\n${toPrintableJson(chabo.getAscMultiWeights())}`);
    ns.tprintf(`• suitableEquipment:\n${toPrintableJson(chabo.getSuitableEquipment())}`);
    ns.tprintf(`• combatMultiWeight: ${chabo.combatMultiWeight}`);
    ns.tprintf(`• ombatAscMultiWeight: ${chabo.combatAscMultiWeight}`);
    ns.tprintf(`• combatStatsMulti: ${chabo.combatStatsMulti}`);
    ns.tprintf(`• combatStatsAscMulti: ${chabo.combatStatsAscMulti}`);
    ns.tprintf(`• isNoob: ${chabo.isNoob()}`);
    ns.tprintf(`• isBlank: ${chabo.isBlank()}`);
    ns.tprintf(`• isWorking: ${chabo.isWorking()}`);
    ns.tprintf(`• canAscend: ${chabo.canAscend()}`);
    ns.tprintf(`• shouldAscend: ${chabo.shouldAscend()}`);
    ns.tprintf(`• needsTraining: ${chabo.needsTraining()}`);
}

