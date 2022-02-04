export function toPrintableString(thing = {}, blacklist = ["ns"]) : string{
	return JSON.stringify(thing, (key, value) => {
		if (blacklist.indexOf(key) > -1) {
			return undefined;
		}

		return value;
	}, 2);
}

export function random(min : number, max : number) : number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
  

export function capatalize(string : string) : string {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

/**
 * @returns {string} found rank or undefined if nothing was found 
 */
export function rankValue(value : number, ranks : string[], valueMax : number) : string | undefined {
    const rankCount = ranks.length;
    const step = Math.round(valueMax / rankCount);
    let i = 0;
    
    for (let currValue = 1; currValue <= valueMax; currValue += step) {
        if (value >= currValue && value < (currValue + step) || i === rankCount - 1) {
            return ranks[i];
        }

        i++;
    }

    return undefined;
}

export function asLabel(string : string, width = 0) : string {
    const spacer = (width > 0) ? " ".repeat(width - string.length) : "";
    return  `${capatalize(string)}:${spacer}`;
}

/**
 * Given percentage(s) in decimal format (i.e 1 => 100%)
 */
 export function asPercent(numbers : number|number[], decimals = 1, usePadding = true) : string | string[] {
    const isArray = Array.isArray(numbers);
    let nums : number[];

    if (!isArray) {
        nums = [numbers];
    } else {
        nums = numbers;
    }
    
    let percents : string[] = nums
        .map(n => isNaN(n) ? 0 : n)
        .map(n => (n * 100).toFixed(decimals))
        .map(n => n +'％'); // this is a special percent sign, so ns.tprintf() or ns.sprintf() will not parse it

    if (usePadding) {
        const max = Math.max(...(percents.map(n => n.length)));
        percents = percents.map(n => n.padStart(max, ' '));
    }

    return isArray ? percents : percents[0];
}

const units = ['', 'k', 'm', 'b', 't', 'q', 'Q', 's', 'S'];

/**
 * todo there is: ns.nFormat() *cough*
 * 
 * Given big numbers convert to readable, defaults to 2 decimals
 * Fx 1.400.000 => 1.40m
 * If given array converts according to biggest number in array
 * Fx [10.000, 1.000.000] => [0.01m, 1.00m]
 * Handles up to Septillion (10^24)
 */
export function asFormat(numbers : number | number[], decimals = 2, usePadding = true) : string | string[] {
    const isArray = Array.isArray(numbers);    
    let nums : number[];

    if (!isArray) {
        nums = [numbers];
    } else {
        nums = numbers;
    }
  

    let biggest = Math.max(...(nums.map(Math.abs)));
    let unit = 0;
    for (; biggest >= 1000; unit++, biggest /= 1000);

    const div = Math.pow(10, Math.min(unit, units.length - 1) * 3);
    let formatted : string[] = nums.map(n => (n / div).toFixed(decimals) + units[unit]);

    if (usePadding) {
        const longest = Math.max(...(formatted.map(n => n.length)));
        formatted = formatted.map(n => n.padStart(longest, ' '))
    }

    return isArray ? formatted : formatted[0];
}

/**
 * 
 * @param {string|number} format e.g. 1k 10m 100b 
 * @returns {number}
 */
export function fromFormat(format : string | number) : number {
    if (typeof format === "number") {
        return format;
    }

    const unit = format.slice(-1);
    const unitIdx = units.indexOf(unit);
    const valueString = format.slice(0, -1);
    let multi = 1;

    if (unitIdx !== -1) {
        multi = Math.pow(100, unitIdx + 1);
    }

    const num = Number(valueString);

    if (typeof num !== "number" || Number.isNaN(num)) {
        return 0;
    }

    return num * multi;
}


const unitsGB = ['GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

export function asFormatGB(number : number, decimals = 2) : string {
    let unit = "GB";

    for(let i = unitsGB.length; i > 0; i--) {
        if (number >= Math.pow(1024,i)) {
            unit = unitsGB[i];
            number = number / Math.pow(1024,i);
            break;
        }   
    }
 
    return number.toFixed(decimals) + unit;
}

/**
 * @param text e.g. 1PB, 4096TB
 * @returns amount of GB or NaN when text can not be parsed
 */
export function fromFormatGB(text : string | undefined) : number {
    if (typeof text !== "string" || text === "") {
        return NaN;
    }

    let pow = 1;
    let gigabyte = 0;

    for(let i = 0; i < unitsGB.length; i++) {
        const unit = unitsGB[i].toLowerCase();
        const value = text.toLowerCase();

        if (value.indexOf(unit) !== -1) {
            gigabyte = Number(value.replace(unit, ""));
            pow = i;
            break;
        }
    }

    if (typeof gigabyte !== "number") {
        return NaN;
    } 

    return gigabyte * Math.pow(1024,pow);
}

export function median(numbers : number[]) : number {
    const sorted = numbers.slice().sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
        return (sorted[middle - 1] + sorted[middle]) / 2;
    }

    return sorted[middle];
}

export function format(format : string, ...args : string[]) : string {
    for (const k in args) {
        format = format.replace("{" + k + "}", args[k])
    }

    return format
}

export class NumberStack {

    numbers: number[];
	maxSize: number

	constructor(numbers : number[] = [], maxSize = 0) {
		this.numbers = numbers;
		this.maxSize = maxSize;
	}

	push(number : number) : void {
		if (this.numbers.length >= this.maxSize) {
			this.numbers.shift();
		}

		this.numbers.push(number);
	}

	pop() : number | undefined {
		return this.numbers.pop();
	}

    avg(numbers : number[] = []) : number {
		numbers = numbers || this.numbers;

		if (numbers.length == 0) {
			return 0;
		}

		let sum = 0;
		for (const num of numbers) {
			sum += num;
		}

		return sum / numbers.length;
	}

	diff() : number {
		return this.last() - this.first(); 
	}

	increments() : number[] {
		return this.numbers.map((currVal, index) => {
			const prevVal = this.numbers[index - 1];
			return currVal - prevVal;
		}).filter(Boolean);
	}

	avgIncrement() : number {
		return this.avg(this.increments());
	}

	first() : number {
        return this.numbers[0];
    }

    last() : number {
        return this.numbers[this.numbers.length - 1];
    }

    get length() : number {
        return this.numbers.length;
    }

    isFull() : boolean {
        return this.numbers.length === this.maxSize;
    }
}