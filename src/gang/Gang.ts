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

    recruit() : Chabo | undefined {
        const chaboNames = this.chabos.map(chabo => chabo.name);
        const name = NameGenerator.generate(chaboNames)

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
}