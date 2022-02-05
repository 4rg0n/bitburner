import { asFormat, asFormatGB, asPercent, asLabel } from "lib/utils";
/**
 * Just a method to test the progress bar
 */
export async function main(ns) {
    const progress = new Progression(new ProgressBar(10, 2), undefined, [
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
        distribution.setDistribution({ hack: Math.floor(Math.random() * 11), grow: Math.floor(Math.random() * 11), weaken: Math.floor(Math.random() * 11) });
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
            total: { value: total, total: 30 },
            hack: { value: hack, total: 10 },
            grow: { value: grow, total: 10 },
            weaken: { value: weaken, total: 10 }
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
    progressSize;
    overloadSize;
    progress;
    overload;
    constructor(progressSize = 10, overloadSize = 0, progress = 0, overload = 0) {
        this.progressSize = progressSize;
        this.overloadSize = overloadSize;
        this.progress = progress;
        this.overload = overload;
    }
    setPercentage(percentage) {
        const progress = (Math.ceil((percentage * (this.progressSize) * 100)) / 100);
        return this.setProgress(progress);
    }
    setProgress(progress) {
        if (progress > this.progressSize) {
            this.progress = this.progressSize;
            const overload = progress - this.progressSize;
            this.overload = (overload > this.overloadSize) ? this.overloadSize : overload;
        }
        else {
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
    };
    static Templates = {
        Bar: "bar",
        Percent: "percent",
        Value: "value",
        Total: "total",
        Ratio: "ratio"
    };
    static DefaultTemplate = [
        Progression.Templates.Bar,
        Progression.Templates.Value,
        Progression.Templates.Percent
    ];
    progress;
    progressTotal;
    bar;
    format;
    spacer;
    template;
    error;
    constructor(bar, format = "", template = Progression.DefaultTemplate, spacer = Progression.DefaultSpacer) {
        this.progress = 0;
        this.progressTotal = 0;
        this.bar = bar;
        this.format = format;
        this.spacer = spacer;
        this.template = template;
        this.error = false;
    }
    setProgress(progress, progressTotal) {
        if (typeof progressTotal !== "undefined") {
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
    isValid(number) {
        return typeof number !== "number" || !Number.isFinite(number) || !Number.isNaN(number);
    }
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
            switch (part) {
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
    formatNumber(number) {
        let formatted;
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
export class Progressions {
    keys;
    progressions;
    total;
    indent;
    constructor(size, overload, keys = [], indent = 0, template, format) {
        this.keys = keys;
        this.progressions = {};
        this.total = 0;
        this.indent = " ".repeat(indent);
        for (const key of keys) {
            const loweredKey = key.toLocaleLowerCase();
            this.progressions[loweredKey] = new Progression(new ProgressBar(size, overload), format, template);
        }
    }
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
            parts.push(`${this.indent}${asLabel(key, maxWidth)} ${progression}`);
        }
        return parts;
    }
    toString() {
        return this.formatParts().join("\n");
    }
}
export class Distribution extends Progressions {
    showTotal;
    constructor(size, overload, keys, indent = 0, template, format, showTotal = true) {
        super(size, overload, keys, indent, template, format);
        this.showTotal = showTotal;
    }
    setDistribution(progress) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvZ3Jlc3NCYXJzLmpzIiwic291cmNlUm9vdCI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9zb3VyY2VzLyIsInNvdXJjZXMiOlsidWkvUHJvZ3Jlc3NCYXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFHckU7O0dBRUc7QUFDSCxNQUFNLENBQUMsS0FBSyxVQUFVLElBQUksQ0FBQyxFQUFPO0lBRTlCLE1BQU0sUUFBUSxHQUFHLElBQUksV0FBVyxDQUFDLElBQUksV0FBVyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUU7UUFDL0QsV0FBVyxDQUFDLFNBQVMsQ0FBQyxHQUFHO1FBQ3pCLFdBQVcsQ0FBQyxTQUFTLENBQUMsS0FBSztRQUMzQixXQUFXLENBQUMsU0FBUyxDQUFDLEtBQUs7UUFDM0IsV0FBVyxDQUFDLFNBQVMsQ0FBQyxLQUFLO1FBQzNCLFdBQVcsQ0FBQyxTQUFTLENBQUMsT0FBTztLQUNoQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBRTVCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDekIsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDMUIsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7S0FDL0I7SUFFRCxNQUFNLFlBQVksR0FBRyxJQUFJLFlBQVksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFDeEUsV0FBVyxDQUFDLFNBQVMsQ0FBQyxHQUFHO1FBQ3pCLFdBQVcsQ0FBQyxTQUFTLENBQUMs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