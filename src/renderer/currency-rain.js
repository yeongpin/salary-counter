const appContainer = document.getElementById('app');
// create a dedicated container to place currency rain
const rainContainer = document.createElement('DIV');
rainContainer.classList.add('currency-rain-container');
appContainer.appendChild(rainContainer);

let currentCurrency = 'USD';
let currentColor = '#85bb65'; // Default color
let isRunning = false;
let rainSpeed = 1; // Default speed
let rainSize = 1; // Default size
let rainDensity = 100; // Default density (ms)
let rainInterval = null;
let isEnabled = true; // Default enabled

// random setting
let randomColor = false;
let randomColorInterval = null;

// get Font Awesome class name
function getCurrencyIconClass(currencyCode) {
	switch (currencyCode) {
		case 'USD':
		case 'TWD': return 'fa-dollar-sign';
		case 'EUR': return 'fa-euro-sign';
		case 'GBP': return 'fa-pound-sign';
		case 'JPY':
		case 'CNY': return 'fa-yen-sign';
		default: return 'fa-dollar-sign';
	}
}

// generate random color
function getRandomColor() {
	const letters = '0123456789ABCDEF';
	let color = '#';
	for (let i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

// add currency symbol
function addDollar() {
	if (!rainContainer || !isRunning || !isEnabled) return;
	
	const span = document.createElement('SPAN');
	span.classList.add('dollar-container');
	
	// apply size setting
	const baseSize = 20 + Math.random() * 40;
	span.style.fontSize = (baseSize * rainSize) + 'px';
	
	const leftPos = Math.random() * window.innerWidth;
	span.style.setProperty('--left-pos', leftPos + 'px');
	span.style.left = leftPos + 'px';
	
	// apply speed setting
	const baseDuration = 1 + Math.random() * 3;
	span.style.animationDuration = (baseDuration / rainSpeed) + 's';
	
	// apply color setting
	span.style.color = randomColor ? getRandomColor() : currentColor;
	
	const icon = document.createElement('I');
	icon.classList.add('fas', getCurrencyIconClass(currentCurrency));
	icon.style.animationDuration = (1 + Math.random() * 3) + 's';
	
	span.appendChild(icon);
	rainContainer.appendChild(span);
	
	setTimeout(() => {
		if (span && span.parentNode) {
			span.remove();
		}
	}, 5000);
}

// set currency type
function setCurrency(currency) {
	currentCurrency = currency;
}

// set color
function setColor(color) {
	currentColor = color;
}

// set running
function setRunning(running) {
	isRunning = running;
	
	// reset rain generation interval
	if (isRunning && isEnabled) {
		startRain();
	} else {
		stopRain();
	}
}

// set enabled
function setEnabled(enabled) {
	isEnabled = enabled;
	
	// if disabled, stop rain
	if (!isEnabled) {
		stopRain();
	} else if (isRunning) {
		// if enabled and running, start rain
		startRain();
	}
}

// set speed
function setSpeed(speed) {
	rainSpeed = speed;
}

// set size
function setSize(size) {
	rainSize = size;
}

// set density
function setDensity(density) {
	rainDensity = density;
	
	// if running, reset interval
	if (isRunning && isEnabled) {
		startRain();
	}
}

// set random color
function setRandomColor(value) {
	randomColor = value;
	
	if (randomColor && !randomColorInterval) {
		    // start random color change
		randomColorInterval = setInterval(() => {
			// do nothing, because each rain drop will get random color when created
		}, 1000);
	} else if (!randomColor && randomColorInterval) {
		// stop random color change
		clearInterval(randomColorInterval);
		randomColorInterval = null;
	}
}

// reset all settings
function resetSettings() {
	currentColor = '#85bb65';
	rainSpeed = 1;
	rainSize = 1;
	rainDensity = 100;
	randomColor = false;
	isEnabled = true;
	
	if (randomColorInterval) {
		clearInterval(randomColorInterval);
		randomColorInterval = null;
	}
	
	if (isRunning && isEnabled) {
		startRain();
	}
}

// start rain
function startRain() {
	stopRain(); // stop existing
	
	if (!isEnabled) return; // if disabled, not start
	
	// set interval (the higher the density, the shorter the interval)
	const interval = Math.max(10, 210 - rainDensity);
	rainInterval = setInterval(addDollar, interval);
}

// stop rain
function stopRain() {
	if (rainInterval) {
		clearInterval(rainInterval);
		rainInterval = null;
	}
}

// listen to messages from Vue app
window.addEventListener('message', (event) => {
	const { type, data } = event.data;
	
	switch (type) {
		case 'setCurrency':
			setCurrency(data);
			break;
		case 'setColor':
			setColor(data);
			break;
		case 'setRunning':
			setRunning(data);
			break;
		case 'setEnabled':
			setEnabled(data);
			break;
		case 'setSpeed':
			setSpeed(data);
			break;
		case 'setSize':
			setSize(data);
			break;
		case 'setDensity':
			setDensity(data);
			break;
		case 'setRandomColor':
			setRandomColor(data);
			break;
		case 'resetSettings':
			resetSettings();
			break;
	}
});

// initialize
startRain();

// export functions for Vue app
window.currencyRain = {
	setCurrency,
	setColor,
	setRunning,
	setEnabled,
	setSpeed,
	setSize,
	setDensity,
	setRandomColor,
	resetSettings
};