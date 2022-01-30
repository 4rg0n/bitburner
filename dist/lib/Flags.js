/**
 * Decorator for adding new featues to the ns.flags() method
 */
export class Flags {
    static ParamsFlag = "_";
    /** @typedef {[string, (string | number | boolean | string[]), (string | undefined)]} flagSchema */
    ns;
    script;
    nsFlags;
    paramDefaults;
    flagSchemas;
    constructor(ns, flagSchemas) {
        this.ns = ns;
        this.script = ns.getScriptName();
        if (!Array.isArray(flagSchemas)) {
            throw new Error("flagSchemas is not an Array, is: " + typeof flagSchemas);
        }
        this.flagSchemas = flagSchemas;
        this.nsFlags = [];
        this.paramDefaults = [];
        for (const flag of this.flagSchemas) {
            if (flag[0] === Flags.ParamsFlag) {
                this.paramDefaults.push([flag[0], flag[1]]);
            }
            else {
                this.nsFlags.push([flag[0], flag[1]]);
            }
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    allArgs() {
        return this.ns.args;
    }
    isFlagPresent(name) {
        return this.allArgs().indexOf(`--${name}`) !== -1;
    }
    /**
     * @returns {string}
     */
    cmdLine() {
        return ["run", this.script].concat(...this.allArgs()).join(" ");
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    args() {
        const args = this.ns.flags(this.nsFlags);
        const params = args._;
        for (const i in this.paramDefaults) {
            if (typeof params[i] !== "undefined" && params[i] !== "") {
                continue;
            }
            args._[i] = this.paramDefaults[i][1];
        }
        if (typeof args["help"] !== "undefined" && args["help"] === true) {
            throw "Usage:\n" + this.toString();
        }
        return args;
    }
    toString() {
        const lines = [];
        for (const flag of this.flagSchemas) {
            lines.push(`--${flag[0]} ${(this.defaultToString(flag[1]))}${this.descriptionToString(flag[2])}`);
        }
        return lines.join("\n");
    }
    defaultToString(defaultValue = undefined) {
        if (typeof defaultValue === undefined || defaultValue === "") {
            return "";
        }
        return `[${defaultValue}] `;
    }
    descriptionToString(desc = undefined) {
        if (typeof desc === "undefined") {
            return "";
        }
        return `- ${desc}`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmxhZ3MuanMiLCJzb3VyY2VSb290IjoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL3NvdXJjZXMvIiwic291cmNlcyI6WyJsaWIvRmxhZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7O0dBRUc7QUFDSCxNQUFNLE9BQU8sS0FBSztJQUVkLE1BQU0sQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDO0lBRXhCLG1HQUFtRztJQUVuRyxFQUFFLENBQUk7SUFDTixNQUFNLENBQVE7SUFDZCxPQUFPLENBQWtEO0lBQ3pELGFBQWEsQ0FBa0Q7SUFDL0QsV0FBVyxDQUEwRDtJQUVyRSxZQUFZLEVBQU8sRUFBRSxXQUFzRTtRQUN2RixJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUNiLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBRWpDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQzdCLE1BQU0sSUFBSSxLQUFLLENBQUMsbUNBQW1DLEdBQUcsT0FBTyxXQUFXLENBQUMsQ0FBQztTQUM3RTtRQUVELElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQy9CLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO1FBRXhCLEtBQUssTUFBTSxJQUFJLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNqQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsVUFBVSxFQUFFO2dCQUM5QixJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQy9DO2lCQUFNO2dCQUNILElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxF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