import { Progression, ProgressBar } from "ui/ProgressBars";
import { asFormat } from "lib/utils";

/**
 * For controlling stats in the upper right over view element of the game
 */
export class StatsUI {

	keyWidth: number
	valueWidth: number;
	doc: Document
	keysColumn: HTMLElement | null
	valuesColumn: HTMLElement | null

	constructor(keyWidth = 8, valueWidth = 24) {
		this.keyWidth = keyWidth;
		this.valueWidth = valueWidth;
		this.doc = document; // This is expensive! (25GB RAM) Perhaps there's a way around it? ;)

		this.keysColumn = this.doc.getElementById('overview-extra-hook-0');
		this.valuesColumn = this.doc.getElementById('overview-extra-hook-1');
	}

	/**
	 * @param {UIModel} uiModel
	 */
	update(uiModel : UIModel) : void {
		try {
			const keys = Object.keys(uiModel);
			const values = Object.values(uiModel);

			keys.unshift("_".repeat(this.keyWidth));
			values.unshift("_".repeat(this.valueWidth));
			keys.push("‾".repeat(this.keyWidth));
			values.push("‾".repeat(this.valueWidth));

			if (this.keysColumn === null || this.valuesColumn === null) {
				throw "No HTML elements in column";
			}
			
			this.keysColumn.innerText = keys.join("\n");
			this.valuesColumn.innerText = values.join("\n");
		} catch(err) {
			console.warn("StatsUI update skipped: ", err);
		}
	}
}

export class UIModel {
	Money: ValueTimeUnit
	Rep: ValueTimeUnit
	Script_Money: ValueTimeUnit
	Script_Exp: ValueTimeUnit
	Str_Exp: ValueTimeUnit
	Def_Exp: ValueTimeUnit
	Dex_Exp: ValueTimeUnit
	Agi_Exp: ValueTimeUnit
	Chr_Exp: ValueTimeUnit
	Prv_Load: Progression
	Home_Load: Progression

	constructor(
		rep = 0,
		money = 0,
		incPerSec = 0,
		scrExp = 0,
		strExp = 0, 
		defExpP = 0, 
		dexExpP = 0, 
		agiExp = 0, 
		chrExp = 0,
		pServerUsedGB = 0, 
		pServerMaxGB = 0, 
		hServerUsedGB = 0, 
		hServerMaxGB = 0
	) {
		this.Money = new ValueTimeUnit(money, "$", "m");
		this.Rep = new ValueTimeUnit(rep, "r", "s");

		this.Script_Money = new ValueTimeUnit(incPerSec, "$", "s");
		this.Script_Exp = new ValueTimeUnit(scrExp,  "xp", "s");

		this.Str_Exp = new ValueTimeUnit(strExp,  "xp", "s");
		this.Def_Exp = new ValueTimeUnit(defExpP,  "xp", "s");
		this.Dex_Exp = new ValueTimeUnit(dexExpP,  "xp", "s");
		this.Agi_Exp = new ValueTimeUnit(agiExp,  "xp", "s");
		this.Chr_Exp = new ValueTimeUnit(chrExp,  "xp", "s");

		this.Prv_Load = new Progression(new ProgressBar(10), Progression.Format.Byte, [Progression.Templates.Value, Progression.Templates.Bar]).setProgress(pServerUsedGB, pServerMaxGB);
		this.Home_Load = new Progression(new ProgressBar(10), Progression.Format.Byte, [Progression.Templates.Value, Progression.Templates.Bar]).setProgress(hServerUsedGB, hServerMaxGB);
	}
}

class ValueTimeUnit {

	value: number
	unit: string
	timeUnit: string

	constructor(value: number, unit = "", timeUnit = "") {
		this.value = value;
		this.unit = unit;
		this.timeUnit = timeUnit;
	}

	toString() {
		let text = asFormat(this.value);

		if (this.unit != "") {
			text += " " +  this.unit;
		}

		if (this.timeUnit != "") {
			text += "/" + this.timeUnit;
		}

		return text;
	}
}