import { NS } from '@ns'
import { Chabo, NameGenerator } from '/gang/Chabo';
import { Task } from '/gang/Task';
import { toPrintableString } from '/lib/utils';

export interface IGangConfig {
    chabos: Chabo[]
    tasks: Task[]
}

export interface IGangConfigSimple {
    chabos: string[]
    tasks: string[]
}

export class GangConfig {
    config: IGangConfig[]

    constructor(config : IGangConfig[] = []) {
        this.config = config;
    }

    static fromObjectArray(config : IGangConfig[] = []) : GangConfig {
        return new GangConfig(config);
    }

    static fromFile(ns : NS, path : string) : GangConfig {
        const config = GangConfigGenerator.read(ns, path);
        return new GangConfig(config);
    }

    static fromStringArray(ns : NS, config : [string[], string[]]) : GangConfig {
        const configObjects : IGangConfig[] = config.map((value, i, entry) => {
            const chaboNames = entry[0];
            const taskNames = entry[1];
            
            if (!Array.isArray(chaboNames) || !Array.isArray(chaboNames)) {
                console.warn("Illegal chabo config", chaboNames, taskNames);
                throw new Error(`Illegal chabo config`);
            }

            const chabos = chaboNames.map(name => new Chabo(ns, name));
            const tasks = taskNames.map(name => new Task(ns, name));

            return {chabos: chabos, tasks: tasks};
        });

        if (typeof configObjects === "undefined") {
            return new GangConfig();
        }

        return GangConfig.fromObjectArray(configObjects);
    }

    static fromGenerator(ns : NS, hack = 0, combat = 0) : GangConfig{
        const config = GangConfigGenerator.generateGangConfig(ns, hack, combat);
        return GangConfig.fromObjectArray(config);
    }

    getAllChabos() : Chabo[] {
        const chabos = this.config.flatMap(c => c.chabos);
        return _.uniqBy(chabos, c => c.name);
    }
}

export class GangConfigGenerator {

    static DefaultConfigPath = "/gang/gang.default.json";
    static CurrentConfigPath = "/gang/gang.current.json";
    static MaximumGangMembers = 12;

    static generateGangConfig(ns : NS, hack = 0, combat = 0) : IGangConfig[] {
        const total = hack + combat;

        if (total > GangConfigGenerator.MaximumGangMembers) {
            throw new Error(`Only ${GangConfigGenerator.MaximumGangMembers} members total are allowed got ${total}`);
        }

        let names = NameGenerator.generateMultiple(total, []);
        const config : IGangConfig[] = []; 

        for (let i = 0; i <= hack; i++) {
            config.push({
                chabos: [new Chabo(ns, names[i])],
                tasks: [new Task(ns, Task.Names.Ransomware)]
            });
        }

        names = names.slice(hack - 1);

        for (let i = 0; i <= combat; i++) {
            config.push({
                chabos: [new Chabo(ns, names[i])],
                tasks: [new Task(ns, Task.Names.Mug)]
            });
        }

        return config;
    }

    static async write(ns : NS, config : IGangConfig[], path : string) : Promise<void> {
        const simpleData = GangConfigGenerator.toSimple(config);
        const data = toPrintableString(simpleData);

        await ns.write(path, data, "w");
    }

    static read(ns : NS, path : string) : IGangConfig[] {
        const simpleData = ns.read(path);
        const simpleParsed = JSON.parse(simpleData);
        const data = GangConfigGenerator.fromSimple(ns, simpleParsed);

        if (!_.isArray(data)) return [];

        return data;
    }

    static toSimple(configs : IGangConfig[]) : IGangConfigSimple[] {
        const configSimple : IGangConfigSimple[] = [];

        for (const config of configs) {
            configSimple.push({
                chabos: config.chabos.map(c => c.name),
                tasks: config.tasks.map(t => t.name)
            })
        }

        return configSimple;
    }

    static fromSimple(ns : NS, configSimple : IGangConfigSimple[]) : IGangConfig[] {
        const configs : IGangConfig[] = [];

        for (const config of configSimple) {
            configs.push({
                chabos: config.chabos.map(name => new Chabo(ns, name)),
                tasks: config.tasks.map(name => new Task(ns, name))
            })
        }

        return configs;
    }

    static fromCurrent(ns : NS) : IGangConfig[] {
        return Chabo.get(ns).map(c => {
            return {
                chabos: [c], 
                tasks: [new Task(ns, c.getTaskName())]
            }
        });
    }
    
}