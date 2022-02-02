
import { Flags } from "lib/Flags";
import { toPrintableString } from "lib/utils";
import { NS } from "@ns";
import { Task } from "/gang/Task";
import { Chabo } from "/gang/Chabo";
import { TaskQueue } from "/gang/TaskQueue";
import { Babo } from "/gang/Babo";
import { Equipment } from "/gang/Equipment";
import { GangConfig, GangConfigGenerator } from "/gang/GangConfig";

/**
 * For managing your Gang (WIP) o.O
 */
 export async function main(ns : NS): Promise<void> {
    const flags = new Flags(ns, [
        ["...", [""], `Name of gang member(s) to do either --work, --train or show info via --chabo`],
        ["taskinfo", ["all"], `Show tasks information: ${Object.values(Task.Categories).join(", ")}`],
        ["equipinfo", ["all"], `Show equipment information: ${ns.gang.getEquipmentNames().join(", ")}`],
        ["config", GangConfigGenerator.DefaultConfigPath, `Use configuration file for gang`],
        ["work", "", `Do work by type ${Object.values(TaskQueue.Work).join(", ")}`],
        ["task", "", `Do specific task ${Object.values(Task.Names).join(", ")}`],
        ["train", "", `Do train for task: ${Object.values(Task.Names).join(", ")}`],
        ["chabo", false, `Show chabos information: ${ns.gang.getMemberNames().join(", ")}`],
        ["gang", false, "Show gang information"],
		["help", false, "For managing your gang (WIP)"]
	]);
	const args = flags.args();

    const chaboNames : string[] = args._;
    const taskTypes : string[] = args["taskinfo"];
    const showChabo : boolean = args["chabo"];
    const equipNames : string[] = args["equipinfo"];
    const showGang : boolean = args["gang"];
    const workType : string = args["work"];
    const trainTask : string = args["train"];
    const taskName : string = args["task"];
    const configPath : string = args["config"];

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

    let babo : Babo;

    if (flags.isFlagPresent("config") && configPath !== "") {
        const gangConfigData = GangConfigGenerator.read(ns, configPath);

        if (_.isUndefined(gangConfigData)) {
            ns.tprintf(`ERROR Babo could not load gang config ${configPath}`);
            return;
        }

        const gangConfig = GangConfig.fromObjectArray(gangConfigData);

        babo = new Babo(ns, gangConfig);
        ns.tprintf(`INFO Babo loaded gang config ${configPath}`);
    } else {
        // todo load default config
        babo = new Babo(ns);
    }

    if (workType !== "") {
        ns.disableLog("sleep");
        ns.disableLog("gang.setMemberTask");

        babo.queueWithType(workType);

        while(true) {
            babo.poll();
            await ns.sleep(1000);
        }
    }

    if (taskName !== "") {
        ns.disableLog("sleep");
        ns.disableLog("gang.setMemberTask");

        if (chaboNames.length > 0) {
            chaboNames.forEach(name => babo.queueTask(new Chabo(ns, name), new Task(ns, trainTask)));
        } else {
            babo.queueTask(babo.gang.chabos, new Task(ns, trainTask));
        }
    }   

    if (trainTask !== "") {
        ns.disableLog("sleep");
        ns.disableLog("gang.setMemberTask");

        if (chaboNames.length > 0) {
            chaboNames.forEach(name => babo.queueTask(new Chabo(ns, name), new Task(ns, trainTask)));
        } else {
            babo.queueWithType(TaskQueue.Work.Training, new Task(ns, trainTask));
        }

        while(true) {
            babo.poll();
            await ns.sleep(1000);
        }
    }

    
}

