/**
 * todo add short flag support (e.g. -h)
 *
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
    isPresent(name) {
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
            let param = `${flag[0]}`;
            if (param !== Flags.ParamAllFlag && param !== Flags.ParamFlag) {
                param = `--${param}`;
            }
            lines.push(`${param} ${(this.defaultToString(flag[1]))}${this.descriptionToString(flag[2])}`);
        }
        return lines.join("\n");
    }
    defaultToString(defaultValue = undefined) {
        if (typeof defaultValue === "undefined" || defaultValue === "") {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmxhZ3MuanMiLCJzb3VyY2VSb290IjoiaHR0cDovL2xvY2FsaG9zdDo4MDAwL3NvdXJjZXMvIiwic291cmNlcyI6WyJsaWIvRmxhZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7Ozs7R0FJRztBQUNILE1BQU0sT0FBTyxLQUFLO0lBRWQsTUFBTSxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUM7SUFDdkIsTUFBTSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7SUFFNUIsRUFBRSxDQUFJO0lBQ04sTUFBTSxDQUFRO0lBQ2QsT0FBTyxDQUFrRDtJQUN6RCxhQUFhLENBQWtEO0lBQy9ELFdBQVcsQ0FBMEQ7SUFFckUsWUFBWSxFQUFPLEVBQUUsV0FBc0U7UUFDdkYsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDYixJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUVqQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUM3QixNQUFNLElBQUksS0FBSyxDQUFDLG1DQUFtQyxHQUFHLE9BQU8sV0FBVyxDQUFDLENBQUM7U0FDN0U7UUFFRCxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztRQUMvQixJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNsQixJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQztRQUV4QixLQUFLLE1BQU0sSUFBSSxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDakMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLFlBQVksRUFBRTtnQkFDL0QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUMvQztpQkFBTTtnQkFDSCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3pDO1NBQ0o7SUFDTCxDQUFDO0lBRUQsOERBQThEO0lBQzlELE9BQU87UUFDSCxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO0lBQ3hCLENBQUM7SUFFRCxTQUFTLENBQUMsSUFBYTtRQUNuQixPQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFFRDs7T0FFRztJQUNILE9BQU87UUFDSixPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbkUsQ0FBQztJQUVELDhEQUE4RDtJQUM5RCxJQUFJO1FBQ0EsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7UUFFdEIsS0FBSyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ2hDLElBQUksT0FBTyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssV0FBVyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7Z0JBQ3ZELFNBQVM7YUFDWDtZQUVELElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUN4QztRQUVELElBQUksT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssV0FBVyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxJQUFJLEVBQUU7WUFDOUQsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1NBQ3RDO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELFFBQVE7UUFDSixNQUFNLEtBQUssR0FBRyxFQUFFLENBQUM7UUFFakIsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ2pDLElBQUksS0FBSyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFFekIsSUFBSSxLQUFLLEtBQUssS0FBSyxDQUFDLFlBQVksSUFBSSxLQUFLLEtBQUssS0FBSyxDQUFDLFNBQVMsRUFBRTtnQkFDM0QsS0FBSyxHQUFHLEtBQUssS0FBSyxFQUFFLENBQUM7YUFDeEI7WUFFRCxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDakc7UUFFRCxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUVELGVBQWUsQ0FBQyxlQUFrRSxTQUFTO1FBQ3ZGLElBQUksT0FBTyxZQUFZLEtBQUssV0FBVyxJQUFJLFlBQVksS0FBSyxFQUFFLEVBQUU7WUFDNUQsT0FBTyxFQUFFLENBQUM7U0FDYjtRQUVELE9BQU8sSUFBSSxZQUFZLElBQUksQ0FBQztJQUNoQyxDQUFDO0lBRUQsbUJBQW1CLENBQUMsT0FBNEIsU0FBUztRQUNyRCxJQUFJLE9BQU8sSUFBSSxLQUFLLFdBQVcsRUFBRTtZQUM3QixPQUFPLEVBQUUsQ0FBQztTQUNiO1FBRUQsT0FBTyxLQUFLLElBQUksRUFBRSxDQUFDO0lBQ3ZCLENBQUMifQ==