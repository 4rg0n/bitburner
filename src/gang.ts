
import { Flags } from "lib/Flags";
import { NS } from "@ns";
import { Chabo, Task } from "/gang/Chabo";
import { TaskQueue } from "/gang/TaskQueue";
import { Babo } from "/gang/Babo";
import { GangConfig, GangConfigGenerator} from "/gang/GangConfig";
import { canRunGang } from '/lib/ns0';

/**
 * For managing your Gang (WIP) o.O
 */
 export async function main(ns : NS): Promise<void> {
    canRunGang(ns);
    const flags = new Flags(ns, [
        ["...", [], `Name(s) of gang member(s) to do either --work or --train `],
        ["config", "default", `Use configuration file for gang by alias`],
        ["work", "", `Do work by type ${Object.values(TaskQueue.Work).join(", ")}`],
        ["task", "", `Do specific task ${Object.values(Task.Names).join(", ")}.`],
        ["train", "", `Do train for task: ${Object.values(Task.Names).join(", ")}.`],
		["help", false, "For managing your gang (WIP)"]
	]);
	const args = flags.args();
    ns.tprintf(`\n${flags.cmdLine()} --tail`);

    const chaboNames : string[] = args._;
    const workType : string = args["work"];
    const trainTask : string = args["train"];
    const taskName : string = args["task"];
    const configAlias : string = args["config"];

    let babo : Babo;

    if (configAlias !== "") {
        const gangConfigData = GangConfigGenerator.readAlias(ns, configAlias);

        if (_.isUndefined(gangConfigData)) {
            ns.tprintf(`ERROR Babo could not load gang config ${configAlias}`);
            return;
        }

        const gangConfig = GangConfig.fromObjectArray(gangConfigData);

        babo = new Babo(ns, gangConfig);
        ns.tprintf(`INFO Babo loaded gang config ${configAlias} with ${gangConfig.length} entries`);
    } else {
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
            chaboNames.forEach(name => babo.queueTask(new Chabo(ns, name), new Task(ns, taskName)));
        } else {
            babo.queueTask(babo.gang.chabos, new Task(ns, taskName));
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

