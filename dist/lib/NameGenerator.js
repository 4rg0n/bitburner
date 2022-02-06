import { capatalize, random } from "/lib/utils";
import { Flags } from "/lib/Flags";
export async function main(ns) {
    const flags = new Flags(ns, [
        ["num", 10, "Amount of names to generate"],
        ["help", false, "For testing name generation"]
    ]);
    const args = flags.args();
    const num = args["num"];
    const names = NameGenerator.generateMultiple(num, []).sort(function (a, b) {
        if (a.toLowerCase() < b.toLowerCase()) {
            return -1;
        }
        if (a.toLowerCase() > b.toLowerCase()) {
            return 1;
        }
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
    ];
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
    ];
    static generate(blacklist = []) {
        let name;
        let repeat = false;
        do {
            const randPrefix = NameGenerator.Prefixes[random(0, NameGenerator.Prefixes.length - 1)];
            const randSuffix = NameGenerator.Suffixes[random(0, NameGenerator.Suffixes.length - 1)];
            name = randPrefix + randSuffix;
            repeat = (blacklist.filter(blacklisted => blacklisted.toLowerCase() === name.toLowerCase()).length > 0);
        } while (repeat);
        return `${capatalize(name)}`;
    }
    static generateMultiple(amount = 1, blacklist = []) {
        const names = [];
        for (let i = 0; i < amount; i++) {
            const name = this.generate(blacklist);
            names.push(name);
            blacklist.push(name);
        }
        return names;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmFtZUdlbmVyYXRvci5qcyIsInNvdXJjZVJvb3QiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvc291cmNlcy8iLCJzb3VyY2VzIjpbImxpYi9OYW1lR2VuZXJhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ2hELE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFbkMsTUFBTSxDQUFDLEtBQUssVUFBVSxJQUFJLENBQUMsRUFBTztJQUM5QixNQUFNLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxFQUFFLEVBQUU7UUFDeEIsQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLDZCQUE2QixDQUFDO1FBQzFDLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSw2QkFBNkIsQ0FBQztLQUNqRCxDQUFDLENBQUM7SUFDSCxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7SUFFMUIsTUFBTSxHQUFHLEdBQVksSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRWpDLE1BQU0sS0FBSyxHQUFHLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVMsQ0FBQyxFQUFFLENBQUM7UUFDcEUsSUFBSSxDQUFDLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxFQUFFO1lBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztTQUFFO1FBQ3JELElBQUksQ0FBQyxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRTtZQUFFLE9BQU8sQ0FBQyxDQUFDO1NBQUU7UUFFcEQsT0FBTyxDQUFDLENBQUM7SUFDYixDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ2pDLENBQUM7QUFFRCxNQUFNLE9BQU8sYUFBYTtJQUN0QixNQUFNLENBQUMsUUFBUSxHQUFHO1FBQ2QsS0FBSztRQUNMLElBQUk7UUFDSixLQUFLO1FBQ0wsS0FBSztRQUNMLEtBQUs7UUFDTCxLQUFLO1FBQ0wsS0FBSztRQUNMLEtBQUs7UUFDTCxJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixJQUFJO1FBQ0osS0FBSztRQUNMLElBQUk7UUFDSixLQUFLO1FBQ0wsSUFBSTtLQUNQLENBQUE7SUFFRCxNQUFNLENBQUMsUUFBUSxHQUFHO1FBQ2QsS0FBSztRQUNMLElBQUk7UUFDSixLQUFLO1FBQ0wsS0FBSztRQUNMLE1BQU07UUFDTixNQUFNO1FBQ04sS0FBSztRQUNMLEtBQUs7UUFDTCxJQUFJO1FBQ0osSUFBSTtRQUNKLElBQUk7UUFDSixNQUFNO1FBQ04sTUFBTTtRQUNOLEtBQUs7UUFDTCxJQUFJO1FBQ0osS0FBSztRQUNMLElBQUk7UUFDSixNQUFNO0tBQ1QsQ0FBQTtJQUVELE1BQU0sQ0FBQyxRQUFRLENBQUMsWUFBdUIsRUFBRTtRQUNyQyxJQUFJLElBQWEsQ0FBQztRQUNsQixJQUFJLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFFbkIsR0FBRztZQUNDLE1BQU0sVUFBVSxHQUFHLGFBQWEsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxhQUFhLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hGLE1BQU0sVUFBVSxHQUFHLGFBQWEsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxhQUFhLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hGLElBQUksR0FBRyxVQUFVLEdBQUcsVUFBVSxDQUFDO1lBRS9CLE1BQU0sR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLEtBQUssSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQzNHLFFBQVEsTUFBTSxFQUFFO1FBRWpCLE9BQU8sR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztJQUNqQyxDQUFDO0lBRUQsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsWUFBdUIsRUFBRTtRQUN6RCxNQUFNLEtBQUssR0FBYyxFQUFFLENBQUM7UUFFNUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUM3QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRXRDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDakIsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QjtRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUMifQ==