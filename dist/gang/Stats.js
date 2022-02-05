export const StatNames = {
    Hack: "hack",
    Agi: "agi",
    Dex: "dex",
    Def: "def",
    Str: "str",
    Cha: "cha"
};
export class StatsMapper {
    static extractStatAscMulti(statName, chaboInfo) {
        const statMultiName = StatsMapper.mapStatToAscMulti(statName);
        const value = chaboInfo[statMultiName];
        if (!_.isNumber(value)) {
            return 0;
        }
        return value;
    }
    static extractStatMulti(statName, chaboInfo) {
        const statMultiName = StatsMapper.mapStatToMulti(statName);
        const value = chaboInfo[statMultiName];
        if (!_.isNumber(value)) {
            return 0;
        }
        return value;
    }
    static extractAscResult(statName, ascension) {
        const value = ascension[statName];
        if (!_.isNumber(value)) {
            return 0;
        }
        return value;
    }
    static extractStatWeight(statName, taskInfo) {
        const statWeight = StatsMapper.mapStatToStatWeight(statName);
        const value = taskInfo[statWeight];
        if (!_.isNumber(value)) {
            return 0;
        }
        return value;
    }
    /**
     * @param statWeights
     * @returns list of stats, which are effected by weight > 0
     */
    static getEffectedStats(statWeights) {
        const stats = [];
        for (const key in statWeights) {
            const value = statWeights[key];
            if (value > 0)
                stats.push(StatsMapper.mapStatWeightToStat(key));
        }
        return stats;
    }
    /**
     *
     * @param statWeights
     * @returns stat name with highest weight
     */
    static getMostEffectedStat(statWeights) {
        const statWeightsFlat = [];
        for (const key in statWeights) {
            const value = statWeights[key];
            statWeightsFlat.push({ name: key, value: value });
        }
        const highestStatWeight = _.sortBy(statWeightsFlat, stat => stat.value).reverse()[0];
        return StatsMapper.mapStatWeightToStat(highestStatWeight.name);
    }
    static mapTaskStatsToStatsWeight(tasksStats) {
        const statWeights = {
            hackWeight: 0,
            strWeight: 0,
            defWeight: 0,
            dexWeight: 0,
            agiWeight: 0,
            chaWeight: 0
        };
        const statWeightKeys = Object.keys(statWeights);
        // calculate avg of all tasks stat weights
        for (const key of statWeightKeys) {
            const sum = Object.values(tasksStats)
                .map(v => _.toNumber(v))
                .reduce((a, b) => a + b, 0);
            statWeights[key] = sum / tasksStats.length;
        }
        return statWeights;
    }
    static mapStatWeightToStat(statWeightName) {
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
    static mapStatToStatWeight(statName) {
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
    static mapStatToMulti(statName) {
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
    static mapStatToAscMulti(statName) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhdHMuanMiLCJzb3VyY2VSb290IjoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL3NvdXJjZXMvIiwic291cmNlcyI6WyJnYW5nL1N0YXRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQTJCQSxNQUFNLENBQUMsTUFBTSxTQUFTLEdBQUc7SUFDckIsSUFBSSxFQUFFLE1BQU07SUFDWixHQUFHLEVBQUUsS0FBSztJQUNWLEdBQUcsRUFBRSxLQUFLO0lBQ1YsR0FBRyxFQUFFLEtBQUs7SUFDVixHQUFHLEVBQUUsS0FBSztJQUNWLEdBQUcsRUFBRSxLQUFLO0NBQ2IsQ0FBQTtBQUVELE1BQU0sT0FBTyxXQUFXO0lBRXBCLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxRQUFpQixFQUFFLFNBQTBCO1FBQ3BFLE1BQU0sYUFBYSxHQUFHLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM5RCxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsYUFBcUMsQ0FBQyxDQUFDO1FBRS9ELElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ3BCLE9BQU8sQ0FBQyxDQUFDO1NBQ1o7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRUQsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFFBQWlCLEVBQUUsU0FBMEI7UUFDakUsTUFBTSxhQUFhLEdBQUcsV0FBVyxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMzRCxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsYUFBcUMsQ0FBQyxDQUFDO1FBRS9ELElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ3BCLE9BQU8sQ0FBQyxDQUFDO1NBQ1o7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRUQsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFFBQWlCLEVBQUUsU0FBK0I7UUFDdEUsTUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLFFB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