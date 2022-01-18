// @ts-check
/** @typedef {import(".").NS} NS */

/**
 * 
 * @param {any} thing 
 * @param {string[]} blacklist of keys to not print 
 * @returns 
 */
export function toPrintableString(thing, blacklist = ["ns"]) {
	return JSON.stringify(thing, (key, value) => {
		if (blacklist.indexOf(key) > -1) {
			return undefined;
		}

		return value;
	}, 2);
}

/**
 * 
 * @param {string} string 
 * @returns {string}
 */
export function capatalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

/**
 * 
 * @param {number} value 
 * @param {string[]} ranks 
 * @param {number} valueMax
 * 
 * @returns {string} found rank or undefined if nothing was found 
 */
export function rankValue(value, ranks, valueMax) {
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

/**
 * 
 * @param {string} string 
 * @param {number} width 
 * @returns {string}
 */
export function asLabel(string, width = 0) {
    const spacer = (width > 0) ? " ".repeat(width - string.length) : "";
    return  `${capatalize(string)}:${spacer}`;
}

/**
 * Given percentage(s) in decimal format (i.e 1 => 100%)
 * 
 * @param {number|number[]} numbers
 * @param {number} decimals
 * @param {boolean} usePadding
 * @returns {string|string[]}
 */
 export function asPercent(numbers, decimals = 1, usePadding = true) {
    let isArray = Array.isArray(numbers);
    // @ts-ignore
    if (!isArray) numbers = [numbers];
    
    let percents = numbers
        // @ts-ignore
        .map(n => (n * 100).toFixed(decimals))
        .map(n => isNaN(n) ? 0 : n)
        .map(n => n +'％'); // this is a special percent sign, so ns.tprintf() or ns.sprintf() will not parse it

    if (usePadding) {
        let max = Math.max(...(percents.map(n => n.length)));
        percents = percents.map(n => n.padStart(max, ' '));
    }

    return isArray ? percents : percents[0];
}

let units = ['', 'k', 'm', 'b', 't', 'q', 'Q', 's', 'S'];

/**
 * Given big numbers convert to readable, defaults to 2 decimals
 * Fx 1.400.000 => 1.40m
 * If given array converts according to biggest number in array
 * Fx [10.000, 1.000.000] => [0.01m, 1.00m]
 * Handles up to Septillion (10^24)
 * 
 * @param {number|number[]} numbers
 * @param {number} decimals
 * @param {boolean} usePadding
 * @returns {string|string[]}
 */
export function asFormat(numbers, decimals = 2, usePadding = true) {
    let isArray = Array.isArray(numbers);    
    // @ts-ignore
    if (!isArray) numbers = [numbers];

    // @ts-ignore
    let biggest = Math.max(...(numbers.map(Math.abs)));
    let unit = 0;
    for (; biggest >= 1000; unit++, biggest /= 1000) {
    }

    let div = Math.pow(10, Math.min(unit, units.length - 1) * 3);
    // @ts-ignore
    let formatted = numbers.map(n => (n / div).toFixed(decimals) + units[unit]);
    if (usePadding) {
        let longest = Math.max(...(formatted.map(n => n.length)));
        formatted = formatted.map(n => n.padStart(longest, ' '))
    }

    return isArray ? formatted : formatted[0];
}

/**
 * 
 * @param {string|number} format e.g. 1k 10m 100b 
 * @returns {number}
 */
export function fromFormat(format) {
    if (typeof format === "number") {
        return format;
    }

    let unit = format.slice(-1);
    let unitIdx = units.indexOf(unit);
    let valueString = format.slice(0, -1);
    let num;
    let multi = 1;

    if (unitIdx !== -1) {
        multi = Math.pow(100, unitIdx + 1);
    }

    num = Number(valueString);

    if (typeof num !== "number" || Number.isNaN(num)) {
        return 0;
    }

    return num * multi;
}


let unitsGB = ['GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

/**
 * @param {number} number 
 * @param {number} decimals 
 * @returns 
 */
export function asFormatGB(number, decimals = 2) {
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
 * 
 * @param {string} text 
 */
export function fromFormatGB(text) {
    let pow = 1;
    let gigabyte = 0;

    for(let i = 0; i < unitsGB.length; i++) {
        if (text.toLowerCase().indexOf(unitsGB[i].toLowerCase()) !== -1) {
            // @ts-ignore
            gigabyte = new Number(text.replace(unitsGB[i], ""));
            pow = i;
            break;
        }
    }

    if (typeof gigabyte !== "number") {
        return NaN;
    } 

    return gigabyte * Math.pow(1024,pow);
}

/**
 * 
 * @param {number[]} numbers 
 * @returns {number}
 */
export function median(numbers) {
    const sorted = numbers.slice().sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
        return (sorted[middle - 1] + sorted[middle]) / 2;
    }

    return sorted[middle];
}

export class NumberStack {
	/**
	 * @param {number[]} numbers
	 * @param {number} maxSize
	 */
	constructor(numbers = [], maxSize = 0) {
		this.numbers = numbers;
		this.maxSize = maxSize;
	}

    /**
     * 
     * @param {number} number 
     */
	push(number) {
		if (this.numbers.length >= this.maxSize) {
			this.numbers.shift();
		}

		this.numbers.push(number);
	}

	pop() {
		return this.numbers.pop();
	}

	avg(numbers = []) {
		numbers = numbers || this.numbers;

		if (numbers.length == 0) {
			return 0;
		}

		let sum = 0;
		for (let num of numbers) {
			sum += num;
		}

		return sum / numbers.length;
	}

	diff() {
		return this.last() - this.first(); 
	}

	increasements() {
		return this.numbers.map((currVal, index) => {
			if (index === 0) {
				return;
			}

			const prevVal = this.numbers[index - 1];
			return currVal - prevVal;
		}).filter(Boolean);
	}

	avgIncrement() {
		return this.avg(this.increasements());
	}

	first() {
        return this.numbers[0];
    }

    last() {
        return this.numbers[this.numbers.length - 1];
    }

    get length() {
        return this.numbers.length;
    }

    isFull() {
        return this.numbers.length === this.maxSize;
    }
}