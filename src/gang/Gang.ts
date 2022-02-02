import { GangGenInfo, GangOtherInfo, NS } from '@ns'
import { Chabo, NameGenerator } from 'gang/Chabo';
import { Task } from 'gang/Task';

export class Gang {
    ns: NS

    constructor(ns : NS) {
        this.ns = ns;
    }

    get chabos() : Chabo[] {
        return Chabo.get(this.ns);
    }

    get chabosIdle() : Chabo[] {
        return this.chabos.filter(chabo => !chabo.isWorking());
    }

    get gangInfo() : GangGenInfo {
        return this.ns.gang.getGangInformation();
    }

    get gangOtherInfo() : GangOtherInfo {
        return this.ns.gang.getOtherGangInformation();
    }

    recruitFor(chabos : Chabo[]) : Chabo[] {
        const chabosRecruted : Chabo[] = [];

        for (const chabo of chabos) {
            const chaboRec = this.recruit(chabo.name);

            if (chaboRec instanceof Chabo) {
                chabosRecruted.push(chaboRec);
            }
        }
        
        return chabosRecruted;
    }

    recruit(name = "") : Chabo | undefined {
        if (name === "") {
            const chaboNames = this.chabos.map(chabo => chabo.name);
            name = NameGenerator.generate(chaboNames);
        }

        if (this.ns.gang.recruitMember(name)) {
            return new Chabo(this.ns, name);
        }

        return undefined;
    }
    
    findAvailChabos(task : Task) : Chabo[] {
        const availChabos = this.chabosIdle;

        return this.findSuitableChabos(task, availChabos);
    }

    findSuitableChabos(task : Task, chabos : Chabo[] = []) : Chabo[] {
        if (chabos.length === 0) {
            chabos = this.chabos;
        }

        return chabos.filter(chabo => chabo.isSuitableTask(task));
    }

    findSuitableTasks(chabo : Chabo, currWantedGain = 0) : Task[]  {
        // todo add wanted gain?!

        const tasks = Task.get(this.ns).filter(t => t.type === Task.Types.Combat || t.type === Task.Types.Hack)
            .filter(t => chabo.isSuitableTask(t))
            .filter(t => this.calculateWantedLevelGain(chabo, t) <= currWantedGain)
            .sort((a, b) => a.stats.difficulty - b.stats.difficulty)
            .reverse();

        return tasks;
    }

    findBestChabo(task : Task, chabos : Chabo[] = []) : Chabo {
        if (chabos.length === 0) {
            chabos = this.chabos;
        }

        chabos = chabos.sort((a, b) => a.getTaskDiff(task) - b.getTaskDiff(task));

        return chabos[0];
    }

    getDiscount(): number {
        const power = this.gangInfo.power;
        const respect = this.gangInfo.respect;
    
        const respectLinearFac = 5e6;
        const powerLinearFac = 1e6;
        const discount = Math.pow(respect, 0.01) + respect / respectLinearFac + Math.pow(power, 0.01) + power / powerLinearFac - 1;
        
        return Math.max(1, discount);
    }

    exists(chabo : Chabo) : boolean {
        return this.ns.gang.getMemberNames().indexOf(chabo.name) !== -1;
    }

    filterMissingChabos(chabos : Chabo[]) : Chabo[] {
        return chabos.filter(chabo => !this.exists(chabo));
    }

    filterExistingChabos(chabos : Chabo[]) : Chabo[] {
        return chabos.filter(chabo => this.exists(chabo));
    }

    /**
     * This thing is straight up stolen from: 
     * https://github.com/danielyxie/bitburner/blob/dev/src/Gang/formulas/formulas.ts :x
     */
    calculateWantedLevelGain(chabo: Chabo, task: Task): number {
        if (task.stats.baseWanted === 0) return 0;

        let statWeight =
          (task.stats.hackWeight / 100) * chabo.info.hack +
          (task.stats.strWeight / 100) * chabo.info.str +
          (task.stats.defWeight / 100) * chabo.info.def +
          (task.stats.dexWeight / 100) * chabo.info.dex +
          (task.stats.agiWeight / 100) * chabo.info.agi +
          (task.stats.chaWeight / 100) * chabo.info.cha;

        statWeight -= 3.5 * task.stats.difficulty;
        if (statWeight <= 0) return 0;

        const territoryMult = Math.max(0.005, Math.pow(this.gangInfo.territory * 100, task.stats.territory.wanted) / 100);
        if (_.isNaN(territoryMult) || territoryMult <= 0) return 0;

        if (task.stats.baseWanted < 0) {
          return 0.4 * task.stats.baseWanted * statWeight * territoryMult;
        }

        const calc = (7 * task.stats.baseWanted) / Math.pow(3 * statWeight * territoryMult, 0.8);

        return Math.min(100, calc);
    }
}