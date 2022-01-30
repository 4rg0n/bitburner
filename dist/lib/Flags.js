/**
 * Decorator for adding new featues to the ns.flags() method
 */
export class Flags {
    static ParamFlag = "_";
    static ParamAllFlag = "...";
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
            if (flag[0] === Flags.ParamFlag || flag[0] === Flags.ParamAllFlag) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmxhZ3MuanMiLCJzb3VyY2VSb290IjoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL3NvdXJjZXMvIiwic291cmNlcyI6WyJsaWIvRmxhZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7O0dBRUc7QUFDSCxNQUFNLE9BQU8sS0FBSztJQUVkLE1BQU0sQ0FBQyxTQUFTLEdBQUcsR0FBRyxDQUFDO0lBQ3ZCLE1BQU0sQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO0lBRTVCLEVBQUUsQ0FBSTtJQUNOLE1BQU0sQ0FBUTtJQUNkLE9BQU8sQ0FBa0Q7SUFDekQsYUFBYSxDQUFrRDtJQUMvRCxXQUFXLENBQTBEO0lBRXJFLFlBQVksRUFBTyxFQUFFLFdBQXNFO1FBQ3ZGLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ2IsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUMsYUFBYSxFQUFFLENBQUM7UUFFakMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQUU7WUFDN0IsTUFBTSxJQUFJLEtBQUssQ0FBQyxtQ0FBbUMsR0FBRyxPQUFPLFdBQVcsQ0FBQyxDQUFDO1NBQzdFO1FBRUQsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDL0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDbEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7UUFFeEIsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ2pDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxZQUFZLEVBQUU7Z0JBQy9ELElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDL0M7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