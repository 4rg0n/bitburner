// @ts-check
/** @typedef {import(".").NS} NS */

/**
 * Decorator for adding new featues to the ns.flags() method
 */
export class Flags {

    static ParamsFlag = "_";

    /**
     * @param {NS} ns
     * @param {[string, (string | number | boolean | string[]), (string | undefined)][]} flagSchemas 
     */
    constructor(ns, flagSchemas) {
        this.ns = ns;
        this.script = ns.getScriptName();

        if (!Array.isArray(flagSchemas)) {
            throw new Error("flagSchemas is not an Array, is: " + typeof flagSchemas);
        }

        this.flagSchemas = flagSchemas;
        /** @type {[string, string | number | boolean | string[]][]} */
        this.nsFlags = [];
        this.paramDefaults = [];

        for (const flag of this.flagSchemas) {
            if (flag[0] === Flags.ParamsFlag) {
                this.paramDefaults.push([flag[0], flag[1]]);
            } else {
                this.nsFlags.push([flag[0], flag[1]]);
            }
        }
    }

    /**
     * @returns {(string | number | boolean)[]}
     */
    allArgs() {
        return this.ns.args;
    }

    /**
     * @returns {string}
     */
    cmdLine() {
       // @ts-ignore
       return ["run", this.script].concat(this.allArgs()).join(" ");
    }

    /**
     * @typedef {Object.<string, string | number | boolean | string[]>} pair
     * 
     * 
     * @returns {pair[]}}
     */
    args() {
        /** @type {{_: {}[]}} */
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

        // @ts-ignore fix type
        return args;
    }

    toString() {
        const lines = [];

        for (const flag of this.flagSchemas) {
            lines.push(`--${flag[0]} ${(this.defaultToString(flag[1]))}${this.descriptionToString(flag[2])}`);
        }

        return lines.join("\n");
    }

    /**
     * @param {*} defaultValue 
     * @returns {string}
     */
    defaultToString(defaultValue = undefined) {
        if (typeof defaultValue === undefined || defaultValue === "") {
            return "";
        }

        return `[${defaultValue}] `;
    }

    /**
     * @param {string} desc 
     * @returns {string}
     */
    descriptionToString(desc = undefined) {
        if (typeof desc === "undefined") {
            return "";
        }

        return `- ${desc}`;
    }
}
