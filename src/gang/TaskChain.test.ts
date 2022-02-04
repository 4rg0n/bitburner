import { NS } from '@ns'
import { Chabo, Task, TaskChain } from '/gang/Chabo'
import { TestRunner } from '/test/TestRunner';

export async function main(ns : NS) : Promise<void> {
    const runner = new TestRunner(ns);
    runner.run(Tests);
}

const Tests = {
    test_trainFromChabo_combat: (ns : NS) : void => {
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
        const chabo = new Chabo(nsMock, "test");
        TaskChain.trainFromChabo(ns, chabo);
    },
    
    test_trainFromTasks: (ns : NS) : void => {
        const taskMock = new Task(ns, Task.Names.Phishing);
        TaskChain.trainFromTasks(ns, [taskMock]);
    }
}

