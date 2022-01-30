
import { Flags } from "lib/Flags";
import { toPrintableString } from "lib/utils";
import { NS } from "@ns";
import { Task } from "/gang/Task";
import { Chabo } from "/gang/Chabo";
import { TaskQueue } from "/gang/TaskQueue";
import { Babo } from "/gang/Babo";
import { Equipment } from "/gang/Equipment";

/**
 * For managing your Gang (WIP) o.O
 */
 export async function main(ns : NS): Promise<void> {
    const flags = new Flags(ns, [
        ["task", ["all"], `Show tasks information: ${Object.values(Task.Types).join(", ")}`],
        ["chabo", ["all"], `Show chabos information ${ns.gang.getMemberNames().join(", ")}`],
        ["equip", ["all"], `Show equipment information ${ns.gang.getEquipmentNames().join(", ")}`],
        ["work", "", `Do work ${Object.values(TaskQueue.Work).join(", ")}`],
        ["train", "", `Do train for task: ${Object.values(Task.Names).join(", ")}`],
        ["gang", false, "Show gang information"],
		["help", false, "For managing your gang (WIP)"]
	]);
	const args = flags.args();

    const taskTypes : string[] = args["task"];
    const chaboNames : string[] = args["chabo"];
    const equipNames : string[] = args["equip"];
    const showGang : boolean = args["gang"];
    const workType : string = args["work"];
    const trainTask : string = args["train"];

    if (flags.isFlagPresent("task")) {
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

    if (flags.isFlagPresent("chabo")) {
        if (chaboNames.length > 0 && chaboNames[0] !== "all") {
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

    if (flags.isFlagPresent("equip")) {
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

    if (workType !== "") {
        ns.disableLog("sleep");
        ns.disableLog("gang.setMemberTask");
        const babo = new Babo(ns);

        babo.init(workType);

        while(true) {
            babo.poll();
            await ns.sleep(1000);
        }
    }

    if (trainTask !== "") {
        ns.disableLog("sleep");
        ns.disableLog("gang.setMemberTask");
        const babo = new Babo(ns);

        babo.init(TaskQueue.Work.Training, new Task(ns, trainTask));

        while(true) {
            babo.poll();
            await ns.sleep(1000);
        }
    }
}

