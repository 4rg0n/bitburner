
import { Flags } from "lib/Flags";
import { NS } from "@ns";
import { Chabo } from "/gang/Chabo";
import { TaskQueue } from "/gang/TaskQueue";
import { Babo } from "/gang/Babo";
import { GangConfig, GangConfigGenerator} from "/gang/GangConfig";
import { canRunGang } from '/lib/ns0';
import { Task } from '/gang/Task';

/**
 * For managing your Gang (WIP) o.O
 */
 export async function main(ns : NS): Promise<void> {
    canRunGang(ns);
    const flags = new Flags(ns, [
        ["...", [], `Name(s) of gang member(s) to do either --work or --train `],
        ["config", "default", `Use configuration file for gang by alias`],
        ["work", TaskQueue.Work.Money, `Do work by type ${Object.values(TaskQueue.Work).join(", ")}`],
        ["task", Task.Names.Laundering, `Do specific task ${Object.values(Task.Names).join(", ")}.`],
        ["train", Task.Names.Phishing, `Do train for task: ${Object.values(Task.Names).join(", ")}.`],
        ["multi", 1, `Use multiplier for training`],
		["help", false, "For managing your gang (WIP)"]
	]);
	const args = flags.args();
    ns.tprintf(`\n${flags.cmdLine()} --tail`);

    const chaboNames : string[] = args._;
    const workType : string = args["work"];
    const trainTask : string = args["train"];
    const taskName : string = args["task"];
    const configAlias : string = args["config"];
    const progMulti : string = args["multi"];

    let babo : Babo;

    if (configAlias !== "") {
        const gangConfigData = GangConfigGenerator.readAlias(ns, configAlias);

        if (_.isUndefined(gangConfigData)) {
            ns.tprintf(`ERROR Babo could not load gang config ${configAlias}`);
            return;
        }

        const gangConfig = GangConfig.fromObjectArray(gangConfigData);

        babo = new Babo(ns, gangConfig, progMulti);
        ns.tprintf(`INFO Babo loaded gang config ${configAlias} with ${gangConfig.length} entries`);
    } else {
        babo = new Babo(ns, undefined, progMulti);
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
            const chabos = chaboNames.map(name => new new Chabo(ns, name));
            babo.queueTrain(new Task(ns, trainTask), chabos);
        } else {
            babo.queueTrain(new Task(ns, trainTask));
        }

        while(true) {
            babo.poll();
            await ns.sleep(1000);
        }
    } 
}

