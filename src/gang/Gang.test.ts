import { NS } from '@ns'
import { Chabo } from '/gang/Chabo'
import { Gang } from '/gang/Gang'
import { hasGangApi } from '/lib/ns0';
import { Assert } from '/test/Assert';
import { TestRunner } from '/test/TestRunner';
import { Task } from '/gang/Task';

export async function main(ns : NS) : Promise<void> {
    if (TestRunner.shouldSkip(ns, !hasGangApi(ns), "need gang api")) return;

    const runner = new TestRunner(ns);
    runner.run(Tests);
}

const Tests = {
    test_findSuitableTask_hack: (ns : NS) : void => {
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
        
        const gang = new Gang(ns);
        const chabo = new Chabo(nsMock, "test");
        const tasksAvail = Task.get(ns, undefined, Object.values(Task.Names));
        const tasks = gang.findSuitableTasks(chabo, undefined, tasksAvail);
        
        Assert.isArray(tasks);
        Assert.notEmpty(tasks);
        
        // only hack tasks
        tasks.forEach(t => {
            Assert.equal(t.type, Task.Types.Hack);
        });
    },

    test_findSuitableTask_combat: (ns : NS) : void => {
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
        
                hack_mult: 0,
                str_mult: 25,
                def_mult: 25,
                dex_mult: 25,
                agi_mult: 25,
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
        
        const gang = new Gang(ns);
        const chabo = new Chabo(nsMock, "test");
        const tasksAvail = Task.get(ns, undefined, Object.values(Task.Names));
        const tasks = gang.findSuitableTasks(chabo, undefined, tasksAvail);
        
        Assert.isArray(tasks);
        Assert.notEmpty(tasks);
        
        // only combat tasks
        tasks.forEach(t => {
            Assert.equal(t.type, Task.Types.Combat);
        });
    },
}

