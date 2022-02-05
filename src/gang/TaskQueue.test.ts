import { NS } from '@ns'
import { Gang } from '/gang/Gang';
import { TaskQueue } from '/gang/TaskQueue';
import { Assert } from '/test/Assert';
import { TestRunner } from '/test/TestRunner';
import { Task, Chabo, ChaboTasks } from '/gang/Chabo';
import { hasGangApi } from '/lib/ns0';

export async function main(ns : NS) : Promise<void> {
    if (TestRunner.shouldSkip(ns, !hasGangApi(ns), "need gang api")) return;

    const runner = new TestRunner(ns);
    runner.run(Tests);
}

const Tests = {
    test_createPeaceTask_justice: (ns : NS) => {
        const gang = new Gang(ns);
        const taskQueue = new TaskQueue(ns, gang);

        const nsMock = ns;
        nsMock.gang.getMemberInformation = () => {
            return {
                name: "test",
                task: Task.Names.Unassigned,
                earnedRespect: 0,
                hack: 0,
                str: 0,
                def: 0,
                dex: 0,
                agi: 0,
                cha: 0,
        
                hack_exp: 0,
                str_exp: 0,
                def_exp: 0,
                dex_exp: 0,
                agi_exp: 0,
                cha_exp: 0,
        
                hack_mult: 20,
                str_mult: 20,
                def_mult: 20,
                dex_mult: 20,
                agi_mult: 20,
                cha_mult: 0,
        
                hack_asc_mult: 0,
                str_asc_mult: 0,
                def_asc_mult: 0,
                dex_asc_mult: 0,
                agi_asc_mult: 0,
                cha_asc_mult: 0,
        
                hack_asc_points: 0,
                str_asc_points: 0,
                def_asc_points: 0,
                dex_asc_points: 0,
                agi_asc_points: 0,
                cha_asc_points: 0,
        
                upgrades: [],
                augmentations: [],
        
                respectGain: 0,
                wantedLevelGain: 0,
                moneyGain: 0,
            };
        }
        const chabo = new Chabo(nsMock, "test");
        const chaboTasks = taskQueue.createPeaceTask([chabo]);

        Assert.notUndefinedOrNull(chaboTasks);
        Assert.isLength((chaboTasks as ChaboTasks).chain.tasks, 1);
        Assert.isLength(
            (chaboTasks as ChaboTasks).chain.tasks.filter(t => t.name === Task.Names.Justice), 
            1, 
            `There must be 1 "${Task.Names.Justice}" task`
        );
        Assert.equal((chaboTasks as ChaboTasks).chabo.name, chabo.name);
    },

    test_createPeaceTask_hacking: (ns : NS) => {
        const gang = new Gang(ns);
        const taskQueue = new TaskQueue(ns, gang);

        const nsMock = ns;
        nsMock.gang.getMemberInformation = () => {
            return {
                name: "test",
                task: Task.Names.Unassigned,
                earnedRespect: 0,
                hack: 0,
                str: 0,
                def: 0,
                dex: 0,
                agi: 0,
                cha: 0,
        
                hack_exp: 0,
                str_exp: 0,
                def_exp: 0,
                dex_exp: 0,
                agi_exp: 0,
                cha_exp: 0,
        
                hack_mult: 80,
                str_mult: 0,
                def_mult: 0,
                dex_mult: 0,
                agi_mult: 0,
                cha_mult: 20,
        
                hack_asc_mult: 0,
                str_asc_mult: 0,
                def_asc_mult: 0,
                dex_asc_mult: 0,
                agi_asc_mult: 0,
                cha_asc_mult: 0,
        
                hack_asc_points: 0,
                str_asc_points: 0,
                def_asc_points: 0,
                dex_asc_points: 0,
                agi_asc_points: 0,
                cha_asc_points: 0,
        
                upgrades: [],
                augmentations: [],
        
                respectGain: 0,
                wantedLevelGain: 0,
                moneyGain: 0,
            };
        }
        const chabo = new Chabo(nsMock, "test");
        const chaboTasks = taskQueue.createPeaceTask([chabo]);

        Assert.notUndefinedOrNull(chaboTasks);
        Assert.isLength((chaboTasks as ChaboTasks).chain.tasks, 1);
        Assert.isLength(
            (chaboTasks as ChaboTasks).chain.tasks.filter(t => t.name === Task.Names.EthHacking), 
            1, 
            `There must be 1 "${Task.Names.EthHacking}" task`
        );
        Assert.equal((chaboTasks as ChaboTasks).chabo.name, chabo.name);
    }
}