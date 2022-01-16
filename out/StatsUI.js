// @ts-check
import { Progression, ProgressBar } from "./ProgressBar.js";
import { asFormat, NumberStack } from "./utils.js";

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
	const repBuffer = new NumberStack([], 60);
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
		const repGained = ns.getPlayer().workRepGained;

		moneyBuffer.push(moneyCurr);
		repBuffer.push(repGained);
		// todo only show stat exp when it is actualy not 0 
		strExpBuffer.push(strExp);
		defExpBuffer.push(defExp);
		dexExpBuffer.push(dexExp);
		agiExpBuffer.push(agiExp);
		chrExpBuffer.push(chrExp);
				
		ui.update(new UIModel(
			repBuffer.avgIncrement(),
			moneyBuffer.diff(),
			ns.getScriptIncome()[0],
			ns.getScriptExpGain(),
			strExpBuffer.avgIncrement(),
			defExpBuffer.avgIncrement(),
			dexExpBuffer.avgIncrement(),
			agiExpBuffer.avgIncrement(),
			chrExpBuffer.avgIncrement(),
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