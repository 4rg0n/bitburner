import { Chabo, Task, TaskChain } from '/gang/Chabo';
import { Gang } from '/gang/Gang';
import { Assert } from '/test/Assert';
import { TestRunner } from '/test/TestRunner';
export async function main(ns) {
    const runner = new TestRunner(ns);
    runner.run(GangTest);
}
const GangTest = {
    test_findSuitableTask: (ns) => {
        const nsMock = ns;
        // mock ns function
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
                str_mult: 0,
                def_mult: 0,
                dex_mult: 0,
                agi_mult: 0,
                cha_mult: 0,
                hack_asc_mult: 80,
                str_asc_mult: 0,
                def_asc_mult: 0,
                dex_asc_mult: 0,
                agi_asc_mult: 0,
                cha_asc_mult: 20,
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
        const gang = new Gang(ns);
        const chabo = new Chabo(nsMock, "test");
        const tasks = gang.findSuitableTasks(chabo, 0);
        Assert.isArray(tasks);
        Assert.notEmpty(tasks);
    },
    test_trainFromChabo: (ns) => {
        const chaboMock = new Chabo(ns, "test");
        TaskChain.trainFromChabo(ns, chaboMock);
    },
    test_trainFromTasks: (ns) => {
        const taskMock = new Task(ns, Task.Names.Phishing);
        TaskChain.trainFromTasks(ns, [taskMock]);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FuZ1Rlc3QuanMiLCJzb3VyY2VSb290IjoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL3NvdXJjZXMvIiwic291cmNlcyI6WyJ0ZXN0L0dhbmdUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxNQUFNLGFBQWEsQ0FBQTtBQUNwRCxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFBO0FBQ2pDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDdEMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBRTlDLE1BQU0sQ0FBQyxLQUFLLFVBQVUsSUFBSSxDQUFDLEVBQU87SUFDOUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFbEMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN6QixDQUFDO0FBRUQsTUFBTSxRQUFRLEdBQUc7SUFDYixxQkFBcUIsRUFBRSxDQUFDLEVBQU8sRUFBUyxFQUFFO1FBQ3RDLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUVsQixtQkFBbUI7UUFDbkIsTUFBTSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxHQUFHLEVBQUU7WUFDcEMsT0FBTztnQkFDSCxJQUFJLEVBQUUsTUFBTTtnQkFDWixJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVO2dCQUMzQixhQUFhLEVBQUUsQ0FBQztnQkFDaEIsSUFBSSxFQUFFLENBQUM7Z0JBQ1AsR0FBRyxFQUFFLENBQUM7Z0JBQ04sR0FBRyxFQUFFLENBQUM7Z0JBQ04sR0FBRyxFQUFFLENBQUM7Z0JBQ04sR0FBRyxFQUFFLENBQUM7Z0JBQ04sR0FBRyxFQUFFLENBQUM7Z0JBRU4sUUFBUSxFQUFFLENBQUM7Z0JBQ1gsT0FBTyxFQUFFLENBQUM7Z0JBQ1YsT0FBTyxFQUFFLENBQUM7Z0JBQ1YsT0FBTyxFQUFFLENBQUM7Z0JBQ1YsT0FBTyxFQUFFLENBQUM7Z0JBQ1YsT0FBTyxFQUFFLENBQUM7Z0JBRVYsU0FBUyxFQUFFLENBQUM7Z0JBQ1osUUFBUSxFQUFFLENBQUM7Z0JBQ1gsUUFBUSxFQUFFLENBQUM7Z0JBQ1gsUUFBUSxFQUFFLENBQUM7Z0JBQ1gsUUFBUSxFQUFFLENBQUM7Z0JBQ1gsUUFBUSxFQUFFLENBQUM7Z0JBRVgsYUFBYSxFQUFFLEVBQUU7Z0JBQ2pCLFlBQVksRUFBRSxDQUFDO2dCQUNmLFlBQVksRUFBRSxDQUFDO2dCQUNmLFlBQVksRUFBRSxDQUFDO2dCQUNmLFlBQVksRUFBRSxDQUFDO2dCQUNmLFlBQVksRUFBRSxFQUFFO2dCQUVoQixlQUFlLEVBQUUsQ0FBQztnQkFDbEIsY0FBYyxFQUFFLENBQUM7Z0JBQ2pCLGNBQWMsRUFBRSxDQUFDO2dCQUNqQixjQUFjLEVBQUUsQ0FBQztnQkFDakIsY0FBYyxFQUFFLENBQUM7Z0JBQ2pCLGNBQWMsRUFBRSxDQUFDO2dCQUVqQixRQUFRLEVBQUUsRUFBRTtnQkFDWixhQUFhLEVBQUUsRUFBRTtnQkFFakIsV0FBVyxFQUFFLENBQUM7Z0JBQ2QsZUFBZSxFQUFFLENBQUM7Z0JBQ2xCLFNBQVMsRUFBRSxDQUFDO2FBQ2YsQ0FBQztRQUNOLENBQUMsQ0FBQTtRQUVELE1BQU0sSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzFCLE1BQU0sS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUV4QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRS9DLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFdEIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBRUQsbUJBQW1CLEVBQUUsQ0FBQyxFQUFPLEVBQVMsRUFBRTtRQUNwQyxNQUFNLFNBQVMsR0FBRyxJQUFJLEtBQUssQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDeEMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVELG1CQUFtQixFQUFFLENBQUMsRUFBTyxFQUFTLEVBQUU7UUFDcEMsTUFBTSxRQUFRLEdBQUcsSUFBSSxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbkQsU0FBUyxDQUFDLGNBQWMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQzdDLENBQUM7Q0FDSixDQUFBIn0=