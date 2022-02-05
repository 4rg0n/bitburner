import { Chabo, Task, TaskChain } from '/gang/Chabo';
import { Assert } from '/test/Assert';
import { TestRunner } from '/test/TestRunner';
export async function main(ns) {
    const runner = new TestRunner(ns);
    runner.run(Tests);
}
const Tests = {
    test_trainFromChabo_combat: (ns) => {
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
        };
        const chabo = new Chabo(nsMock, "test");
        const chain = TaskChain.trainFromChabo(ns, chabo);
        Assert.notUndefinedOrNull(chain);
        Assert.isLength(chain.tasks, 1);
        chain.tasks.forEach(t => {
            Assert.equal(t.type, Task.Types.Train);
        });
        Assert.isLength(chain.tasks.filter(t => t.name === Task.Names.TrainCombat), 1, `There must be 1 "${Task.Names.TrainCombat}" task`);
    },
    test_trainFromChabo_hacking: (ns) => {
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
        const chain = TaskChain.trainFromChabo(ns, chabo);
        Assert.notUndefinedOrNull(chain);
        Assert.isLength(chain.tasks, 2);
        chain.tasks.forEach(t => {
            Assert.equal(t.type, Task.Types.Train);
        });
        Assert.isLength(chain.tasks.filter(t => t.name === Task.Names.TrainCharisma), 1, `There must be 1 "${Task.Names.TrainCharisma}" task`);
        Assert.isLength(chain.tasks.filter(t => t.name === Task.Names.TrainHacking), 1, `There must be 1 "${Task.Names.TrainHacking}" task`);
    },
    test_trainFromTask_hacking: (ns) => {
        const task = new Task(ns, Task.Names.Phishing);
        const chain = TaskChain.trainFromTasks(ns, [task]);
        Assert.notUndefinedOrNull(chain);
        Assert.isLength(chain.tasks, 2);
        chain.tasks.forEach(t => {
            Assert.equal(t.type, Task.Types.Train);
        });
        Assert.isLength(chain.tasks.filter(t => t.name === Task.Names.TrainCharisma), 1, `There must be 1 "${Task.Names.TrainCharisma}" task`);
        Assert.isLength(chain.tasks.filter(t => t.name === Task.Names.TrainHacking), 1, `There must be 1 "${Task.Names.TrainHacking}" task`);
    },
    test_trainFromTask_combat: (ns) => {
        const task = new Task(ns, Task.Names.Mug);
        const chain = TaskChain.trainFromTasks(ns, [task]);
        Assert.notUndefinedOrNull(chain);
        Assert.isLength(chain.tasks, 2);
        chain.tasks.forEach(t => {
            Assert.equal(t.type, Task.Types.Train);
        });
        Assert.isLength(chain.tasks.filter(t => t.name === Task.Names.TrainCombat), 1, `There must be 1 "${Task.Names.TrainCombat}" task`);
        Assert.isLength(chain.tasks.filter(t => t.name === Task.Names.TrainCharisma), 1, `There must be 1 "${Task.Names.TrainCharisma}" task`);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFza0NoYWluLnRlc3QuanMiLCJzb3VyY2VSb290IjoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL3NvdXJjZXMvIiwic291cmNlcyI6WyJnYW5nL1Rhc2tDaGFpbi50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxNQUFNLGFBQWEsQ0FBQTtBQUNwRCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQ3RDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUU5QyxNQUFNLENBQUMsS0FBSyxVQUFVLElBQUksQ0FBQyxFQUFPO0lBQzlCLE1BQU0sTUFBTSxHQUFHLElBQUksVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2xDLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDdEIsQ0FBQztBQUVELE1BQU0sS0FBSyxHQUFHO0lBQ1YsMEJBQTBCLEVBQUUsQ0FBQyxFQUFPLEVBQVMsRUFBRTtRQUMzQyxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxHQUFHLEVBQUU7WUFDcEMsT0FBTztnQkFDSCxJQUFJLEVBQUUsTUFBTTtnQkFDWixJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVO2dCQUMzQixhQUFhLEVBQUUsQ0FBQztnQkFDaEIsSUFBSSxFQUFFLENBQUM7Z0JBQ1AsR0FBRyxFQUFFLENBQUM7Z0JBQ04sR0FBRyxFQUFFLENBQUM7Z0JBQ04sR0FBRyxFQUFFLENBQUM7Z0JBQ04sR0FBRyxFQUFFLENBQUM7Z0JBQ04sR0FBRyxFQUFFLENBQUM7Z0JBRU4sUUFBUSxFQUFFLENBQUM7Z0JBQ1gsT0FBTyxFQUFFLENBQUM7Z0JBQ1YsT0FBTyxFQUFFLENBQUM7Z0JBQ1YsT0FBTyxFQUFFLENBQUM7Z0JBQ1YsT0FBTyxFQUFFLENBQUM7Z0JBQ1YsT0FBTyxFQUFFLENBQUM7Z0JBRVYsU0FBUyxFQUFFLENBQUM7Z0JBQ1osUUFBUSxFQUFFLEVBQUU7Z0JBQ1osUUFBUSxFQUFFLEVBQUU7Z0JBQ1osUUFBUSxFQUFFLEVBQUU7Z0JBQ1osUUFBUSxFQUFFLEVBQUU7Z0JBQ1osUUFBUSxFQUFFLENBQUM7Z0JBRVgsYUFBYSxFQUFFLENBQUM7Z0JBQ2hCLFlBQVksRUFBRSxDQUFDO2dCQUNmLFlBQVksRUFBRSxDQUFDO2dCQUNmLFlBQVksRUFBRSxDQUFDO2dCQUNmLFlBQVksRUFBRSxDQUFDO2dCQUNmLFlBQVksRUFBRSxDQUFDO2dCQUVmLGVBQWUsRUFBRSxDQUFDO2dCQUNsQixjQUFjLEVBQUUsQ0FBQztnQkFDakIsY0FBYyxFQUFFLENBQUM7Z0JBQ2pCLGNBQWMsRUFBRSxDQUFDO2dCQUNqQixjQUFjLEVBQUUsQ0FBQztnQkFDakIsY0FBYyxFQUFFLENBQUM7Z0JBRWpCLFFBQVEsRUFBRSxFQUFFO2dCQUNaLGFBQWEsRUFBRSxFQUFFO2dCQUVqQixXQUFXLEVBQUUsQ0FBQztnQkFDZCxlQUFlLEVBQUUsQ0FBQztnQkFDbEIsU0FBUyxFQUFFLENBQUM7YUFDZixDQUFDO1FBQ04sQ0FBQyxDQUFBO1FBQ0QsTUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3hDLE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxjQUFjLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRWxELE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNqQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDaEMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDcEIsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDM0MsQ0FBQyxDQUFDLENBQUM7UUFFSCxNQUFNLENBQUMsUUFBUSxDQUNYLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxFQUMxRCxDQUFDLEVBQ0Qsb0JBQW9CLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxRQUFRLENBQ3JELENBQUM7SUFDTixDQUFDO0lBRUQsMkJBQTJCLEVBQUUsQ0FBQyxFQUFPLEVBQVMsRUFBRTtRQUM1QyxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxHQUFHLEVBQUU7WUFDcEMsT0FBTztnQkFDSCxJQUFJLEVBQUUsTUFBTTtnQkFDWixJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVO2dCQUMzQixhQUFhLEVBQUUsQ0FBQztnQkFDaEIsSUFBSSxFQUFFLENBQUM7Z0JBQ1AsR0FBRyxFQUFFLENBQUM7Z0JBQ04sR0FBRyxFQUFFLENBQUM7Z0JBQ04sR0FBRyxFQUFFLENBQUM7Z0JBQ04sR0FBRyxFQUFFLENBQUM7Z0JBQ04sR0FBRyxFQUFFLENBQUM7Z0JBRU4sUUFBUSxFQUFFLENBQUM7Z0JBQ1gsT0FBTyxFQUFFLENBQUM7Z0JBQ1YsT0FBTyxFQUFFLENBQUM7Z0JBQ1YsT0FBTyxFQUFFLENBQUM7Z0JBQ1YsT0FBTyxFQUFFLENBQUM7Z0JBQ1YsT0FBTyxFQUFFLENBQUM7Z0JBRVYsU0FBUyxFQUFFLEVBQUU7Z0JBQ2IsUUFBUSxFQUFFLENBQUM7Z0JBQ1gsUUFBUSxFQUFFLENBQUM7Z0JBQ1gsUUFBUSxFQUFFLENBQUM7Z0JBQ1gsUUFBUSxFQUFFLENBQUM7Z0JBQ1gsUUFBUSxFQUFFLEVBQUU7Z0JBRVosYUFBYSxFQUFFLENBQUM7Z0JBQ2hCLFlBQVksRUFBRSxDQUFDO2dCQUNmLFlBQVksRUFBRSxDQUFDO2dCQUNmLFlBQVksRUFBRSxDQUFDO2dCQUNmLFlBQVksRUFBRSxDQUFDO2dCQUNmLFlBQVksRUFBRSxDQUFDO2dCQUVmLGVBQWUsRUFBRSxDQUFDO2dCQUNsQixjQUFjLEVBQUUsQ0FBQztnQkFDakIsY0FBYyxFQUFFLENBQUM7Z0JBQ2pCLGNBQWMsRUFBRSxDQUFDO2dCQUNqQixjQUFjLEVBQUUsQ0FBQztnQkFDakIsY0FBYyxFQUFFLENBQUM7Z0JBRWpCLFFBQVEsRUFBRSxFQUFFO2dCQUNaLGFBQWEsRUFBRSxFQUFFO2dCQUVqQixXQUFXLEVBQUUsQ0FBQztnQkFDZCxlQUFlLEVBQUUsQ0FBQztnQkFDbEIsU0FBUyxFQUFFLENBQUM7YUFDZixDQUFDO1FBQ04sQ0FBQyxDQUFBO1FBQ0QsTUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3hDLE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxjQUFjLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRWxELE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNqQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDaEMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDcEIsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDM0MsQ0FBQyxDQUFDLENBQUM7UUFFSCxNQUFNLENBQUMsUUFBUSxDQUNYLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxFQUM1RCxDQUFDLEVBQ0Qsb0JBQW9CLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxRQUFRLENBQ3ZELENBQUM7UUFDRixNQUFNLENBQUMsUUFBUSxDQUNYLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxFQUMzRCxDQUFDLEVBQ0Qsb0JBQW9CLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxRQUFRLENBQ3RELENBQUM7SUFDTixDQUFDO0lBRUQsMEJBQTBCLEVBQUUsQ0FBQyxFQUFPLEVBQVMsRUFBRTtRQUMzQyxNQUFNLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMvQyxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsY0FBYyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFFbkQsTUFBTSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2pDLE1BQU0sQ0FBQyxRQUFRLENBQUUsS0FBbUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDOUMsS0FBbUIsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ25DLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzNDLENBQUMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxDQUFDLFFBQVEsQ0FDVixLQUFtQixDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLEVBQzNFLENBQUMsRUFDRCxvQkFBb0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLFFBQVEsQ0FDdkQsQ0FBQztRQUNGLE1BQU0sQ0FBQyxRQUFRLENBQ1YsS0FBbUIsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxFQUMxRSxDQUFDLEVBQ0Qsb0JBQW9CLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxRQUFRLENBQ3RELENBQUM7SUFDTixDQUFDO0lBRUQseUJBQXlCLEVBQUUsQ0FBQyxFQUFPLEVBQVMsRUFBRTtRQUMxQyxNQUFNLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMxQyxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsY0FBYyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFFbkQsTUFBTSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2pDLE1BQU0sQ0FBQyxRQUFRLENBQUUsS0FBbUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDOUMsS0FBbUIsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ25DLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzNDLENBQUMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxDQUFDLFFBQVEsQ0FDVixLQUFtQixDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEVBQ3pFLENBQUMsRUFDRCxvQkFBb0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLFFBQVEsQ0FDckQsQ0FBQztRQUNGLE1BQU0sQ0FBQyxRQUFRLENBQ1YsS0FBbUIsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxFQUMzRSxDQUFDLEVBQ0Qsb0JBQW9CLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxRQUFRLENBQ3ZELENBQUM7SUFDTixDQUFDO0NBQ0osQ0FBQSJ9