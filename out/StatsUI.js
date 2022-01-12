import { Progression, ProgressBar } from "./ProgressBar.js";
import { asFormat } from "./utils.js";

/** @typedef {import(".").NS} NS */

/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog("ALL");

	const moneyBuffer = new NumberStack([], 60);
	const strExpBuffer = new NumberStack([], 60);
	const defExpBuffer = new NumberStack([], 60);
	const dexExpBuffer = new NumberStack([], 60);
	const agiExpBuffer = new NumberStack([], 60);
	const chrExpBuffer = new NumberStack([], 60);
	const ui = new StatsUI(12, 28);

	while(true) {
		const pServers = ns.getPurchasedServers();
		const pServerTotalRamMax = pServers.map(server => ns.getServerMaxRam(server)).reduce((a, b) => a + b, 0);
        const pServerTotalRamUsed = pServers.map(server =>  ns.getServerUsedRam(server)).reduce((a, b) => a + b, 0);
		const hServerRamMax = ns.getServerMaxRam("home");
		const hServerRamUsed = ns.getServerUsedRam("home");
		const moneyCurr = ns.getServerMoneyAvailable("home");
		const strExp = ns.getPlayer().strength_exp;
		const defExp = ns.getPlayer().defense_exp;
		const dexExp = ns.getPlayer().dexterity_exp;
		const agiExp = ns.getPlayer().agility_exp;
		const chrExp = ns.getPlayer().charisma_exp;

		moneyBuffer.push(moneyCurr);
		// todo only show stat exp when it is actualy not 0 
		strExpBuffer.push(strExp);
		defExpBuffer.push(defExp);
		dexExpBuffer.push(dexExp);
		agiExpBuffer.push(agiExp);
		chrExpBuffer.push(chrExp);
				
		ui.update(new UIModel(
			moneyBuffer.diff(),
			ns.getScriptIncome()[0],
			ns.getScriptExpGain(),
			strExpBuffer.diff(),
			defExpBuffer.diff(),
			dexExpBuffer.diff(),
			agiExpBuffer.diff(),
			chrExpBuffer.diff(),
			pServerTotalRamUsed, 
			pServerTotalRamMax, 
			hServerRamUsed,
			hServerRamMax
		));

		await ns.sleep(1000);		
	}
}

/**
 * For controlling stats in the upper right over view element of the game
 */
export class StatsUI {
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
	update(uiModel) {
		try {
			const keys = Object.keys(uiModel);
			const values = Object.values(uiModel);

			keys.unshift("_".repeat(this.keyWidth));
			values.unshift("_".repeat(this.valueWidth));
			keys.push("‾".repeat(this.keyWidth));
			values.push("‾".repeat(this.valueWidth));
			
			this.keysColumn.innerText = keys.join("\n");
			this.valuesColumn.innerText = values.join("\n");
		} catch(err) {
			console.warn("StatsUI update skipped: ", err);
		}
	}
}

export class UIModel {
	constructor(
		moneyPerMin = 0,
		incPerSec = 0,
		scrExpPerMin = 0,
		strExpPerMin = 0, 
		defExpPerMin = 0, 
		dexExpPerMin = 0, 
		agiExpPerMin = 0, 
		chrExpPerMin = 0,
		pServerUsedGB = 0, 
		pServerMaxGB = 0, 
		hServerUsedGB = 0, 
		hServerMaxGB = 0
	) {
		this.Money = new ValueTimeUnit(moneyPerMin, "$", "m");

		this.Script_Money = new ValueTimeUnit(incPerSec, "$", "s");
		this.Script_Exp = new ValueTimeUnit(scrExpPerMin,  "xp", "s");

		this.Str_Exp = new ValueTimeUnit(strExpPerMin,  "xp", "m");
		this.Def_Exp = new ValueTimeUnit(defExpPerMin,  "xp", "m");
		this.Dex_Exp = new ValueTimeUnit(dexExpPerMin,  "xp", "m");
		this.Agi_Exp = new ValueTimeUnit(agiExpPerMin,  "xp", "m");
		this.Chr_Exp = new ValueTimeUnit(chrExpPerMin,  "xp", "m");

		this.Prv_Load = new Progression(new ProgressBar(10), Progression.Format.Byte, [Progression.Templates.Value, Progression.Templates.Bar]).setProgress(pServerUsedGB, pServerMaxGB);
		this.Home_Load = new Progression(new ProgressBar(10), Progression.Format.Byte, [Progression.Templates.Value, Progression.Templates.Bar]).setProgress(hServerUsedGB, hServerMaxGB);
	}
}

class ValueTimeUnit {
	constructor(value, unit = "", timeUnit = "") {
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

class NumberStack {
	/**
	 * @param {number[]} elements
	 * @param {number} maxSize
	 */
	constructor(elements, maxSize) {
		this.elements = elements;
		this.maxSize = maxSize;
	}

	push(element) {
		if (this.elements.length >= this.maxSize) {
			this.elements.shift();
		}

		this.elements.push(element);
	}

	pop() {
		return this.elements.pop();
	}

	avg(elements = undefined) {
		elements = elements || this.elements;

		let sum = 0;
		for (let num of elements) {
			sum += num;
		}

		return sum / elements.length;
	}

	diff() {
		return this.last() - this.first(); 
	}

	increases() {
		return this.elements.map((currVal, index) => {
			if (index === 0) {
				return;
			}

			const prevVal = this.elements[index - 1];
			return ((currVal - prevVal) / prevVal);
		}).filter(Boolean);
	}

	first() {
        return this.elements[0];
    }

    last() {
        return this.elements[this.elements.length - 1];
    }
}