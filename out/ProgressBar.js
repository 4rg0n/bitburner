// @ts-check 
/** @typedef {import(".").NS} NS */
import { asFormat, asFormatGB, asPercent, asLabel } from "./utils.js";

/** 
 * Just a method to test the progress bar
 * 
 * @param {NS} ns 
 */
export async function main(ns) {

    const progress = new Progression(new ProgressBar(10,2), null, [
        Progression.Templates.Bar, 
        Progression.Templates.Value, 
        Progression.Templates.Total,
        Progression.Templates.Ratio,
        Progression.Templates.Percent
    ]);

    ns.tprintf("Progression\n");

    for (let i = 1; i < 14; i++) {
        ns.tprintf(`${progress}`);
        progress.setProgress(i, 10);
    }

    const distribution = new Distribution(10, 0, ["hack", "grow", "weaken"], 2, [
        Progression.Templates.Bar, 
        Progression.Templates.Value, 
        Progression.Templates.Total,
        Progression.Templates.Ratio,
        Progression.Templates.Percent
    ]);

    ns.tprintf("\nDistribution\n");

    for (let i = 0; i < 3; i++) {
        distribution.setProgress({hack: Math.floor(Math.random() * 11), grow: Math.floor(Math.random() * 11), weaken: Math.floor(Math.random() * 11)});
        ns.tprintf(`${distribution}`);
        ns.tprintf("\n");
    }

    const progressions = new Progressions(10, 0, ["total", "hack", "grow", "weaken"], 2, [
        Progression.Templates.Bar, 
        Progression.Templates.Value, 
        Progression.Templates.Total,
        Progression.Templates.Ratio,
        Progression.Templates.Percent
    ]);

    ns.tprintf("\nProgressions\n");

    for (let i = 0; i < 3; i++) {
        const hack = Math.floor(Math.random() * 11);
        const grow = Math.floor(Math.random() * 11);
        const weaken = Math.floor(Math.random() * 11);
        const total = hack + grow + weaken;

        progressions.setProgress({
            total: {value: total, total: 30},
            hack: {value: hack, total: 10},
            grow: {value: grow, total: 10},
            weaken: {value: weaken, total: 10}
        });
        ns.tprintf(`${progressions}`);
        ns.tprintf("\n");
    }
}

/**
 * For displaying a progress bar 
 */
export class ProgressBar {
    static Signs = {
        None: "_",
        Progress: "░",
        Overload: "▒",
        Break: "¦"
    };

    constructor(progressSize = 10, overloadSize = 0, progress = 0, overload = 0) {
        this.progressSize = progressSize;
        this.overloadSize = overloadSize;
        this.progress = progress;
        this.overload = overload;
    }

    /**
     * @param {number} percentage
     * @returns {ProgressBar}
     */
    setPercentage(percentage) {
        const progress = (Math.ceil((percentage * (this.progressSize) * 100)) / 100);
        return this.setProgress(progress);
    }

    /**
     * 
     * @param {number} progress 
     * @returns {ProgressBar}
     */
    setProgress(progress) {
        if (progress > this.progressSize) {
            this.progress = this.progressSize;
            const overload = progress - this.progressSize;
            this.overload = (overload > this.overloadSize) ? this.overloadSize : overload;
        } else {
            this.progress = progress;
            if (progress <= this.progressSize) {
                this.overload = 0;
            }
        }

        return this;
    }

    /**
     * 
     * @returns {string} e.g. [|||||-----]
     */
    toString() {
        const progressSigns = Array(this.progressSize).fill(ProgressBar.Signs.None); 
        const overloadSigns = Array(this.overloadSize).fill(ProgressBar.Signs.None); 

        for (let i = 0; i < progressSigns.length; i++) {
            if (i < this.progress) {
                progressSigns[i] = ProgressBar.Signs.Progress;
            }
        }

        for (let i = 0; i < overloadSigns.length; i++) {
            if (i < this.overload) {
                overloadSigns[i] = ProgressBar.Signs.Overload;
            }
        }

        let signs = progressSigns;
        if (this.overloadSize > 0) {
            signs = signs.concat(ProgressBar.Signs.Break, ...overloadSigns);
        }
   
        return `[${signs.join("")}]`;
    }

    reset() {
        this.progress = 0;
        this.overload = 0;
    }

    get size() {
        return this.progressSize + this.overloadSize;
    }
}

/**
 * Adds additional info to display from a progress bar
 */
export class Progression {

    static DefaultSpacer = " ";

    static Format = {
        Byte: "byte"
    }

    static Templates = {
        Bar: "bar",
        Percent: "percent",
        Value: "value",
        Total: "total",
        Ratio: "ratio"
    }

    static DefaultTemplate = [
        Progression.Templates.Bar, 
        Progression.Templates.Value, 
        Progression.Templates.Percent
    ];

    /**
     * 
     * @param {ProgressBar} bar 
     * @param {string} format
     * @param {string[]} template 
     * @param {string} spacer 
     */
    constructor(bar, format = "", template = Progression.DefaultTemplate, spacer = Progression.DefaultSpacer) {
        this.progress = 0;
        this.progressTotal = 0;
        this.bar = bar;
        this.format = format;
        this.spacer = spacer;
        this.template = template;
        this.error = false;
    }

    /**
     * 
     * @param {number} progress 
     * @param {number} progressTotal 
     * @returns {Progression}
     */
    setProgress(progress, progressTotal = undefined) {
        if (typeof progressTotal != undefined) {
            this.progressTotal = progressTotal;
        }

        this.progress = progress;
        this.bar.setPercentage(this.getPercentage());

        return this;
    }

    getPercentage() {
        return this.progress / this.progressTotal;
    }

    reset() {
        this.bar.reset();
    }
    /**
     * 
     * @param {number} number 
     * @returns {boolean}
     */
    isValid(number) {
        return typeof number !== "number" || !Number.isFinite(number) || !Number.isNaN(number);
    }

    /**
     * 
     * @param  {...number} numbers 
     */
    validate(...numbers) {
        for (const number of numbers) {
            if (!this.isValid(number)) {
                return false;
            }
        }

        return true;
    }
    
    /**
     * @returns {string} e.g. [|||||-----] 50.00 (50%)
     */
    toString() {
        if (!this.validate(this.progress, this.progressTotal)) {
            return "ERROR :(";
        }

        return this.formatParts(this.template).join(this.spacer);
    }

    formatParts(template = Progression.DefaultTemplate) {
        const parts = [];

        for (const part of template) {
            switch(part) {
                case Progression.Templates.Bar: 
                    parts.push(this.bar.toString());
                    break;
                case Progression.Templates.Value: 
                    parts.push(this.formatNumber(this.progress));
                    break;
                case Progression.Templates.Total: 
                    parts.push(this.formatNumber(this.progressTotal));
                    break;
                case Progression.Templates.Ratio: 
                    parts.push(`(${this.formatNumber(this.progress)}/${this.formatNumber(this.progressTotal)})`);
                    break;       
                case Progression.Templates.Percent: 
                    parts.push(`(${asPercent(this.getPercentage())})`);
                    break;              
            }
        }

        return parts;
    }
    
    /**
     * 
     * @param {number} number 
     * @returns 
     */
    formatNumber(number) {
        switch (this.format) {
            default:
                return asFormat(number);
            case Progression.Format.Byte:
                return asFormatGB(number);   
        }
    }
}

export class Progressions {
    /**
     * 
     * @param {number} size 
     * @param {number} overload 
     * @param {string[]} keys 
     * @param {number} indent 
     * @param {string[]} template 
     * @param {string} format 
     */
    constructor(size = undefined, overload = undefined, keys = [], indent = 0, template = undefined, format = undefined) {
        this.keys = keys;
        /** @type {Object.<string, Progression>} */
        this.progressions = {};
        this.total = 0;
        this.indent = " ".repeat(indent);


        for (const key of keys) {
            const loweredKey = key.toLocaleLowerCase();
            this.progressions[loweredKey] = new Progression(new ProgressBar(size, overload), format, template);
        }
    }

    /**
     * 
     * @param {Object.<string, {value: number, total: number}>} progress 
     */
    setProgress(progress) {
        for (const key in progress) {
            const loweredKey = key.toLocaleLowerCase();

            if (typeof this.progressions[loweredKey] !== "undefined") {
                const value = progress[key];
                this.progressions[loweredKey].setProgress(value.value, value.total);
            }
        }
    }

    formatParts() {
        const maxWidth = Math.max(...Object.keys(this.progressions).map(p => p.length));
        const parts = [];

        for (const key in this.progressions) {
            const progression = this.progressions[key];

            parts.push(`${this.indent}${asLabel(key, maxWidth)} ${progression}`)
        }

        return parts;
    }

    toString() {
        return this.formatParts().join("\n");
    }   
}

export class Distribution extends Progressions {

    /**
     * 
     * @param {number} size 
     * @param {number} overload 
     * @param {string[]} keys 
     * @param {number} indent 
     * @param {string[]} template 
     * @param {string} format 
     * @param {boolean} showTotal 
     */
    constructor(size = undefined, overload = undefined, keys = [], indent = 0, template = undefined, format = undefined, showTotal = true) {
        super(size, overload, keys, indent, template, format)

        this.showTotal = showTotal;
    }

    /**
     * 
     * @param {Object.<(("total" & string)), number>} progress 
     */
    setProgress(progress) {
        this.total = progress.total || Object.values(progress).reduce((a, b) => a + b, 0);

        for (const key in progress) {
            const loweredKey = key.toLocaleLowerCase();

            if (typeof this.progressions[loweredKey] !== "undefined") {
                const value = progress[key];
                this.progressions[loweredKey].setProgress(value, this.total);
            }
        }
    }

    formatParts() {
        let parts = super.formatParts();

        if (this.showTotal) {
            const total = "Total";
            const maxWidth = Math.max(...Object.keys(this.progressions).map(p => p.length), total.length);
            parts = [`${this.indent}${asLabel(total, maxWidth)} ${asFormat(this.total)}`].concat(parts);
        }

        return parts;
    }

    toString() {
        return this.formatParts().join("\n");
    }   
}

