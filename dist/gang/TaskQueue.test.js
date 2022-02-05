import { Gang } from '/gang/Gang';
import { TaskQueue } from '/gang/TaskQueue';
import { Assert } from '/test/Assert';
import { TestRunner } from '/test/TestRunner';
import { Chabo } from '/gang/Chabo';
import { hasGangApi } from '/lib/ns0';
import { Task } from '/gang/Task';
export async function main(ns) {
    if (TestRunner.shouldSkip(ns, !hasGangApi(ns), "need gang api"))
        return;
    const runner = new TestRunner(ns);
    runner.run(Tests);
}
const Tests = {
    test_createPeaceTask_justice: (ns) => {
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
        };
        const chabo = new Chabo(nsMock, "test");
        const chaboTasks = taskQueue.createPeaceTask([chabo]);
        Assert.notUndefinedOrNull(chaboTasks);
        Assert.isLength(chaboTasks.chain.tasks, 1);
        Assert.isLength(chaboTasks.chain.tasks.filter(t => t.name === Task.Names.Justice), 1, `There must be 1 "${Task.Names.Justice}" task`);
        Assert.equal(chaboTasks.chabo.name, chabo.name);
    },
    test_createPeaceTask_hacking: (ns) => {
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
        };
        const chabo = new Chabo(nsMock, "test");
        const chaboTasks = taskQueue.createPeaceTask([chabo]);
        Assert.notUndefinedOrNull(chaboTasks);
        Assert.isLength(chaboTasks.chain.tasks, 1);
        Assert.isLength(chaboTasks.chain.tasks.filter(t => t.name === Task.Names.EthHacking), 1, `There must be 1 "${Task.Names.EthHacking}" task`);
        Assert.equal(chaboTasks.chabo.name, chabo.name);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFza1F1ZXVlLnRlc3QuanMiLCJzb3VyY2VSb290IjoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL3NvdXJjZXMvIiwic291cmNlcyI6WyJnYW5nL1Rhc2tRdWV1ZS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDbEMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzVDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDdEMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQzlDLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDcEMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUN0QyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBR2xDLE1BQU0sQ0FBQyxLQUFLLFVBQVUsSUFBSSxDQUFDLEVBQU87SUFDOUIsSUFBSSxVQUFVLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRSxlQUFlLENBQUM7UUFBRSxPQUFPO0lBRXhFLE1BQU0sTUFBTSxHQUFHLElBQUksVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2xDLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDdEIsQ0FBQztBQUVELE1BQU0sS0FBSyxHQUFHO0lBQ1YsNEJBQTRCLEVBQUUsQ0FBQyxFQUFPLEVBQUUsRUFBRTtRQUN0QyxNQUFNLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMxQixNQUFNLFNBQVMsR0FBRyxJQUFJLFNBQVMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFMUMsTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLE1BQU0sQ0FBQyxJQUFJLENBQUMsb0JB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