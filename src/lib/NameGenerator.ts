import { NS } from "@ns";
import { capatalize, random } from "/lib/utils";
import { Flags } from "/lib/Flags";

export async function main(ns : NS): Promise<void>  {
    const flags = new Flags(ns, [
        ["num", 10, "Amount of names to generate"],
        ["help", false, "For testing name generation"]
    ]);
    const args = flags.args();

    const num : number = args["num"];

    const names = NameGenerator.generateMultiple(num, []).sort(function(a, b){
        if (a.toLowerCase() < b.toLowerCase()) { return -1; }
        if (a.toLowerCase() > b.toLowerCase()) { return 1; }

        return 0;
    });

    ns.tprintf(names.join("\n"));
}

export class NameGenerator {
    static Prefixes = [
        "ste",
        "ju",
        "gün",
        "jür",
        "wil",
        "rei",
        "ron",
        "eli",
        "je",
        "fe",
        "el",
        "an",
        "hen",
        "ma",
        "kar",
        "ka"
    ]

    static Suffixes = [
        "fen",
        "ri",
        "ter",
        "gen",
        "helm",
        "line",
        "ner",
        "nie",
        "as",
        "ns",
        "li",
        "lias",
        "stof",
        "ler",
        "ne",
        "rik",
        "ik",
        "sten"
    ]

    static generate(blacklist : string[] = []) : string {
        let name : string;
        let repeat = false; 

        do {
            const randPrefix = NameGenerator.Prefixes[random(0, NameGenerator.Prefixes.length - 1)];
            const randSuffix = NameGenerator.Suffixes[random(0, NameGenerator.Suffixes.length - 1)];
            name = randPrefix + randSuffix; 
            console.log("BLACKLIST", blacklist);

            repeat = (blacklist.filter(blacklisted => blacklisted.toLowerCase() === name.toLowerCase()).length > 0);
        } while (repeat);

        return `${capatalize(name)}`;
    }

    static generateMultiple(amount = 1, blacklist : string[] = []) : string[] {
        const names : string[] = [];

        for (let i = 0; i < amount; i++) {
            const name = this.generate(blacklist);

            names.push(name);
            blacklist.push(name);
        }

        return names;
    }
}