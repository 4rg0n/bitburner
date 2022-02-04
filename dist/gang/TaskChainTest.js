import { Chabo, Task, TaskChain } from '/gang/Chabo';
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
        TaskChain.trainFromChabo(ns, chabo);
    },
    test_trainFromTasks: (ns) => {
        const taskMock = new Task(ns, Task.Names.Phishing);
        TaskChain.trainFromTasks(ns, [taskMock]);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFza0NoYWluVGVzdC5qcyIsInNvdXJjZVJvb3QiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvc291cmNlcy8iLCJzb3VyY2VzIjpbImdhbmcvVGFza0NoYWluVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsTUFBTSxhQUFhLENBQUE7QUFDcEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBRTlDLE1BQU0sQ0FBQyxLQUFLLFVBQVUsSUFBSSxDQUFDLEVBQU87SUFDOUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDbEMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN0QixDQUFDO0FBRUQsTUFBTSxLQUFLLEdBQUc7SUFDViwwQkFBMEIsRUFBRSxDQUFDLEVBQU8sRUFBUyxFQUFFO1FBQzNDLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNsQixNQUFNLENBQUMsSUFBSSxDQUFDLG9CQUFvQixHQUFHLEdBQUcsRUFBRTtZQUNwQyxPQUFPO2dCQUNILElBQUksRUFBRSxNQUFNO2dCQUNaLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVU7Z0JBQzNCLGFBQWEsRUFBRSxDQUFDO2dCQUNoQixJQUFJLEVBQUUsQ0FBQztnQkFDUCxHQUFHLEVBQUUsQ0FBQztnQkFDTixHQUFHLEVBQUUsQ0FBQztnQkFDTixHQUFHLEVBQUUsQ0FBQztnQkFDTixHQUFHLEVBQUUsQ0FBQztnQkFDTixHQUFHLEVBQUUsQ0FBQztnQkFFTixRQUFRLEVBQUUsQ0FBQztnQkFDWCxPQUFPLEVBQUUsQ0FBQztnQkFDVixPQUFPLEVBQUUsQ0FBQztnQkFDVixPQUFPLEVBQUUsQ0FBQztnQkFDVixPQUFPLEVBQUUsQ0FBQztnQkFDVixPQUFPLEVBQUUsQ0FBQztnQkFFVixTQUFTLEVBQUUsQ0FBQztnQkFDWixRQUFRLEVBQUUsRUFBRTtnQkFDWixRQUFRLEVBQUUsRUFBRTtnQkFDWixRQUFRLEVBQUUsRUFBRTtnQkFDWixRQUFRLEVBQUUsRUFBRTtnQkFDWixRQUFRLEVBQUUsQ0FBQztnQkFFWCxhQUFhLEVBQUUsQ0FBQztnQkFDaEIsWUFBWSxFQUFFLENBQUM7Z0JBQ2YsWUFBWSxFQUFFLENBQUM7Z0JBQ2YsWUFBWSxFQUFFLENBQUM7Z0JBQ2YsWUFBWSxFQUFFLENBQUM7Z0JBQ2YsWUFBWSxFQUFFLENBQUM7Z0JBRWYsZUFBZSxFQUFFLENBQUM7Z0JBQ2xCLGNBQWMsRUFBRSxDQUFDO2dCQUNqQixjQUFjLEVBQUUsQ0FBQztnQkFDakIsY0FBYyxFQUFFLENBQUM7Z0JBQ2pCLGNBQWMsRUFBRSxDQUFDO2dCQUNqQixjQUFjLEVBQUUsQ0FBQztnQkFFakIsUUFBUSxFQUFFLEVBQUU7Z0JBQ1osYUFBYSxFQUFFLEVBQUU7Z0JBRWpCLFdBQVcsRUFBRSxDQUFDO2dCQUNkLGVBQWUsRUFBRSxDQUFDO2dCQUNsQixTQUFTLEVBQUUsQ0FBQzthQUNmLENBQUM7UUFDTixDQUFDLENBQUE7UUFDRCxNQUFNLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDeEMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUVELG1CQUFtQixFQUFFLENBQUMsRUFBTyxFQUFTLEVBQUU7UUFDcEMsTUFBTSxRQUFRLEdBQUcsSUFBSSxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbkQsU0FBUyxDQUFDLGNBQWMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQzdDLENBQUM7Q0FDSixDQUFBIn0=