import { GangGenInfo, GangMemberInfo, GangOtherInfo, NS } from '@ns'
import { Chabo, Task } from 'gang/Chabo';
import { NameGenerator } from '/lib/NameGenerator';
import { GangConfig } from '/gang/GangConfig';

export class Gang {

    ns: NS
    gangConfig: GangConfig | undefined

    constructor(ns : NS, gangConfig : GangConfig | undefined = undefined) {
        this.ns = ns;
        this.gangConfig = gangConfig;
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

    findSuitableTasks(chabo : Chabo, wantedGainLimit = 10, tasksAvail : Task[] | undefined = undefined) : Task[]  {
        if (_.isUndefined(tasksAvail)) tasksAvail = Task.get(this.ns);

        const tasks = tasksAvail.filter(t => t.type === Task.Types.Combat || t.type === Task.Types.Hack)
            .filter(t => chabo.isSuitableTask(t))
            .filter(t => this.calculateWantedLevelGain(chabo, t) <= wantedGainLimit)
            .sort((a, b) => a.stats.difficulty - b.stats.difficulty)
            .reverse();

        return tasks;
    }

    /**
     * @returns chabos, who can do th egiven tasks, ordered by most effected chabo stat
     */
    findSuitableChabos(task : Task, chabosAvail : Chabo[] = []) : Chabo[] {
        if (chabosAvail.length === 0) {
            chabosAvail = this.chabos;
        }

        const mostEffectedStat = task.getMostEffectedStat();

        return chabosAvail
            .filter(chabo => !chabo.isNoob() && !chabo.isBlank())
            .filter(chabo => chabo.isSuitableTask(task))
            .sort((a, b) => (a.info[mostEffectedStat as keyof GangMemberInfo] as number) - (b.info[mostEffectedStat as keyof GangMemberInfo] as number))
            .reverse();
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