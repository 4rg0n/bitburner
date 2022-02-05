import { GangTaskStats, GangMemberInfo, GangMemberAscension } from '@ns'

export interface StatsWeight {
    hackWeight: number
    strWeight: number
    defWeight: number
    dexWeight: number
    agiWeight: number
    chaWeight: number
}

export interface TrainWeight {
    hack: number
    combat: number
    cha: number
}


export interface Stats {
    hack: number
    str: number
    def: number
    dex: number
    agi: number
    cha: number
}

export const StatNames = {
    Hack: "hack",
    Agi: "agi",
    Dex: "dex",
    Def: "def",
    Str: "str",
    Cha: "cha"
}

export class StatsMapper {

    static extractStatAscMulti(statName : string, chaboInfo : GangMemberInfo) : number {
        const statMultiName = StatsMapper.mapStatToAscMulti(statName);
        const value = chaboInfo[statMultiName as keyof GangMemberInfo];

        if (!_.isNumber(value)) {
            return 0;
        }

        return value;
    }

    static extractStatMulti(statName : string, chaboInfo : GangMemberInfo) : number {
        const statMultiName = StatsMapper.mapStatToMulti(statName);
        const value = chaboInfo[statMultiName as keyof GangMemberInfo];

        if (!_.isNumber(value)) {
            return 0;
        }

        return value;
    }

    static extractAscResult(statName : string, ascension : GangMemberAscension) : number {
        const value = ascension[statName as keyof GangMemberAscension];

        if (!_.isNumber(value)) {
            return 0;
        }

        return value;
    }

    static extractStatWeight(statName : string, taskInfo : GangTaskStats) : number {
        const statWeight = StatsMapper.mapStatToStatWeight(statName);
        const value = taskInfo[statWeight as keyof GangTaskStats];

        if (!_.isNumber(value)) {
            return 0;
        }

        return value;
    }

    /**
     * @param statWeights 
     * @returns list of stats, which are effected by weight > 0
     */
    static getEffectedStats(statWeights : StatsWeight) : string[] {
        const stats : string[] = [];

        for (const key in statWeights) {
            const value = statWeights[key as keyof StatsWeight];
            if (value > 0) stats.push(StatsMapper.mapStatWeightToStat(key));
        }

        return stats;
    }

    /**
     * 
     * @param statWeights 
     * @returns stat name with highest weight
     */
    static getMostEffectedStat(statWeights : StatsWeight) : string {
        const statWeightsFlat : {name: string, value: number}[] = [];

        for (const key in statWeights) {
            const value = statWeights[key as keyof StatsWeight];
            statWeightsFlat.push({name: key, value: value});
        }

        const highestStatWeight = _.sortBy(statWeightsFlat, stat => stat.value).reverse()[0];
        return StatsMapper.mapStatWeightToStat(highestStatWeight.name);
    }
    
    static mapTaskStatsToStatsWeight(tasksStats : GangTaskStats[]) : StatsWeight {
        const statWeights : StatsWeight = {
            hackWeight: 0,
            strWeight: 0,
            defWeight: 0,
            dexWeight: 0,
            agiWeight: 0,
            chaWeight: 0
        }

        const statWeightKeys = Object.keys(statWeights);
        
        // calculate avg of all tasks stat weights
        for (const key of statWeightKeys) {
            const sum = Object.values(tasksStats)
                .map(v => _.toNumber(v))
                .reduce((a, b) => a + b, 0);

            statWeights[key as keyof StatsWeight] = sum / tasksStats.length;
        }

        return statWeights;
    }

    static mapStatWeightToStat(statWeightName : string) : string {
        switch (statWeightName) {
            case "hackWeight":
                return StatNames.Hack;
            case "agiWeight":
                return StatNames.Agi; 
            case "strWeight":
                return StatNames.Str; 
            case "dexWeight":
                return StatNames.Dex; 
            case "defWeight":
                return StatNames.Def; 
            case "chaWeight":
                return StatNames.Cha;
            default:
                throw new Error(`Invalid stat weight name: ${statWeightName}`);     
        }
    }

    static mapStatToStatWeight(statName : string) : string {
        switch (statName) {
            case StatNames.Hack:
                return "hackWeight";
            case StatNames.Agi:
                return "agiWeight"; 
            case StatNames.Str:
                return "strWeight"; 
            case StatNames.Dex:
                return "dexWeight"; 
            case StatNames.Def:
                return "defWeight"; 
            case StatNames.Cha:
                return "chaWeight";
            default:
                throw new Error(`Invalid stat name: ${statName}`);      
        }
    }

    static mapStatToMulti(statName : string) : string {
        switch (statName) {
            case StatNames.Hack:
                return "hack_mult";
            case StatNames.Agi:
                return "agi_mult"; 
            case StatNames.Str:
                return "str_mult"; 
            case StatNames.Dex:
                return "dex_mult"; 
            case StatNames.Def:
                return "def_mult"; 
            case StatNames.Cha:
                return "cha_mult";
            default:
                throw new Error(`Invalid stat name: ${statName}`);     
        }
    }

    static mapStatToAscMulti(statName : string) : string {
        switch (statName) {
            case StatNames.Hack:
                return "hack_asc_mult";
            case StatNames.Agi:
                return "agi_asc_mult"; 
            case StatNames.Str:
                return "str_asc_mult"; 
            case StatNames.Dex:
                return "dex_asc_mult"; 
            case StatNames.Def:
                return "def_asc_mult"; 
            case StatNames.Cha:
                return "cha_asc_mult";
            default:
                throw new Error(`Invalid stat name: ${statName}`);     
        }
    }
}