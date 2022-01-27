import { EquipmentStats, NS } from '@ns'

export class Equipment {
    static Stats = {
        Hack: "hack",
        Agi: "agi",
        Dex: "dex",
        Def: "def",
        Str: "str",
        Cha: "cha"
    }

    static Type = {
        Augmentation: "Augmentation",
        Rootkit: "Rootkit",
        Vehicle: "Vehicle",
        Armor: "Armor", 
        Weapon: "Weapon"
    }

    ns: NS
    name: string

    constructor(ns : NS, name : string) {
        this.ns = ns;
        this.name = name;
    }

    static get(ns : NS) : Equipment[] {
        const names = ns.gang.getEquipmentNames();
        return names.map(name => new Equipment(ns, name));
    }

    static filterByStats(equipments : Equipment[], stats : string[]) : Equipment[] {
        return equipments.filter(e => {
            const equStats = Object.keys(e.stats);
            const matched = stats.filter(stat => equStats.indexOf(stat) !== -1);

            return matched.length > 0;
        });
    }

    static filterByTypes(equipments : Equipment[], types : string[]) : Equipment[] {
        return equipments.filter(e => {
            const matched = types.filter(type => e.type === type);

            return matched.length > 0;
        });
    }

    get cost() : number {
        return this.ns.gang.getEquipmentCost(this.name);
    }

    get stats() : EquipmentStats {
        return this.ns.gang.getEquipmentStats(this.name);
    }

    get type() : string {
        return this.ns.gang.getEquipmentType(this.name);
    }
}