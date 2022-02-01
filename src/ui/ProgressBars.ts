import { NS } from "@ns";
import { asFormat, asFormatGB, asPercent, asLabel } from "lib/utils";
import { UI } from "/ui/UI";

/** 
 * Just a method to test the progress bar
 */
export async function main(ns : NS): Promise<void>  {

    const progress = new Progression(new ProgressBar(10,2), undefined, [
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
        distribution.setDistribution({hack: Math.floor(Math.random() * 11), grow: Math.floor(Math.random() * 11), weaken: Math.floor(Math.random() * 11)});
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
export class ProgressBar implements UI {
    static Signs = {
        None: "_",
        Progress: "░",
        Overload: "▒",
        Break: "¦"
    };

    progressSize: number
    overloadSize: number
    progress: number
    overload: number

    constructor(progressSize = 10, overloadSize = 0, progress = 0, overload = 0) {
        this.progressSize = progressSize;
        this.overloadSize = overloadSize;
        this.progress = progress;
        this.overload = overload;
    }

    setPercentage(percentage : number): this {
        const progress = (Math.ceil((percentage * (this.progressSize) * 100)) / 100);
        return this.setProgress(progress);
    }

    setProgress(progress : number) : this {
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
    toString() : string {
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

    reset() : void {
        this.progress = 0;
        this.overload = 0;
    }

    get size() : number {
        return this.progressSize + this.overloadSize;
    }
}

/**
 * Adds additional info to display from a progress bar
 */
export class Progression implements UI {

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

    progress: number
    progressTotal: number
    bar: ProgressBar
    format: string
    spacer: string
    template: string[]
    error: boolean

    constructor(
        bar : ProgressBar, 
        format : string | undefined = "", 
        template : string[] | undefined = Progression.DefaultTemplate, 
        spacer : string | undefined = Progression.DefaultSpacer
    ) {
        this.progress = 0;
        this.progressTotal = 0;
        this.bar = bar;
        this.format = format;
        this.spacer = spacer;
        this.template = template;
        this.error = false;
    }

    setProgress(progress : number, progressTotal : number | undefined = undefined) : Progression {
        if (typeof progressTotal !== "undefined") {
            this.progressTotal = progressTotal;
        }

        this.progress = progress;
        this.bar.setPercentage(this.getPercentage());

        return this;
    }

    getPercentage() : number {
        return this.progress / this.progressTotal;
    }

    reset() : void {
        this.bar.reset();
    }

    isValid(number : number) : boolean {
        return typeof number !== "number" || !Number.isFinite(number) || !Number.isNaN(number);
    }

    validate(...numbers : number[]) : boolean {
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
    toString() : string {
        if (!this.validate(this.progress, this.progressTotal)) {
            return "ERROR :(";
        }

        return this.formatParts(this.template).join(this.spacer);
    }

    formatParts(template = Progression.DefaultTemplate) : string[] {
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
                default:
                    break;              
            }
        }

        return parts;
    }
    
    formatNumber(number : number) : string {
        let formatted : string | string[];

        switch (this.format) {
            default:
                formatted = asFormat(number);
                break;
                
            case Progression.Format.Byte:
                formatted = asFormatGB(number); 
                break;  
        }

        return Array.isArray(formatted) ? formatted[0] : formatted;
    }
}

export class Progressions implements UI {

    keys: string[]
    progressions: {[key: string]: Progression};
    total: number
    indent: string

    constructor(
        size : number | undefined = undefined,
        overload : number | undefined = undefined, 
        keys : string[] = [], 
        indent = 0,
        template : string[] | undefined = undefined, 
        format : string | undefined = undefined
    ) {
        this.keys = keys;
        this.progressions = {};
        this.total = 0;
        this.indent = " ".repeat(indent);


        for (const key of keys) {
            const loweredKey = key.toLocaleLowerCase();
            this.progressions[loweredKey] = new Progression(new ProgressBar(size, overload), format, template);
        }
    }

    setProgress(progress : {[key: string]: {value: number, total: number}}) : void {
        for (const key in progress) {
            const loweredKey = key.toLocaleLowerCase();

            if (typeof this.progressions[loweredKey] !== "undefined") {
                const value = progress[key];
                this.progressions[loweredKey].setProgress(value.value, value.total);
            }
        }
    }

    formatParts() : string[] {
        const maxWidth = Math.max(...Object.keys(this.progressions).map(p => p.length));
        const parts = [];

        for (const key in this.progressions) {
            const progression = this.progressions[key];

            parts.push(`${this.indent}${asLabel(key, maxWidth)} ${progression}`)
        }

        return parts;
    }

    toString() : string {
        return this.formatParts().join("\n");
    }   
}

export class Distribution extends Progressions implements UI {

    showTotal: boolean

    constructor(
        size : number | undefined = undefined, 
        overload : number | undefined = undefined, 
        keys : string[] | undefined = undefined,
        indent = 0,
        template : string[] | undefined = undefined, 
        format : string | undefined = undefined,
        showTotal = true
    ) {
        super(size, overload, keys, indent, template, format)

        this.showTotal = showTotal;
    }

    setDistribution(progress : {[key: string]: number}) : void {
        this.total = progress.total || Object.values(progress).reduce((a, b) => a + b, 0);

        for (const key in progress) {
            const loweredKey = key.toLocaleLowerCase();

            if (typeof this.progressions[loweredKey] !== "undefined") {
                const value = progress[key];
                this.progressions[loweredKey].setProgress(value, this.total);
            }
        }
    }

    formatParts() : string[] {
        let parts = super.formatParts();

        if (this.showTotal) {
            const total = "Total";
            const maxWidth = Math.max(...Object.keys(this.progressions).map(p => p.length), total.length);
            parts = [`${this.indent}${asLabel(total, maxWidth)} ${asFormat(this.total)}`].concat(parts);
        }

        return parts;
    }

    toString() : string {
        return this.formatParts().join("\n");
    }   
}

