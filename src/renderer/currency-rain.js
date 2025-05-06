const app = document.getElementById('app');
let currentCurrency = 'USD';
let currentColor = '#85bb65'; // 默认绿色
let isRunning = false;
let rainSpeed = 1; // 默认速度
let rainSize = 1; // 默认大小
let rainDensity = 100; // 默认密度 (ms)
let rainInterval = null;
let isEnabled = true; // 默认启用

// 随机设置
let randomColor = false;
let randomColorInterval = null;

// 获取货币符号对应的 Font Awesome 类名
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

// 生成随机颜色
function getRandomColor() {
	const letters = '0123456789ABCDEF';
	let color = '#';
	for (let i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

// 添加货币符号
function addDollar() {
	if (!app || !isRunning || !isEnabled) return;
	
	const span = document.createElement('SPAN');
	span.classList.add('dollar-container');
	
	// 应用大小设置
	const baseSize = 20 + Math.random() * 40;
	span.style.fontSize = (baseSize * rainSize) + 'px';
	
	span.style.left = Math.random() * window.innerWidth + 'px';
	
	// 应用速度设置
	const baseDuration = 1 + Math.random() * 3;
	span.style.animationDuration = (baseDuration / rainSpeed) + 's';
	
	// 应用颜色设置
	span.style.color = randomColor ? getRandomColor() : currentColor;
	
	const icon = document.createElement('I');
	icon.classList.add('fas', getCurrencyIconClass(currentCurrency));
	icon.style.animationDuration = (1 + Math.random() * 3) + 's';
	
	span.appendChild(icon);
	app.appendChild(span);
	
	setTimeout(() => {
		if (span && span.parentNode) {
			span.remove();
		}
	}, 5000);
}

// 设置货币类型
function setCurrency(currency) {
	currentCurrency = currency;
}

// 设置颜色
function setColor(color) {
	currentColor = color;
}

// 设置是否运行
function setRunning(running) {
	isRunning = running;
	
	// 重新设置雨滴生成间隔
	if (isRunning && isEnabled) {
		startRain();
	} else {
		stopRain();
	}
}

// 设置是否启用
function setEnabled(enabled) {
	isEnabled = enabled;
	
	// 如果禁用，停止雨滴
	if (!isEnabled) {
		stopRain();
	} else if (isRunning) {
		// 如果启用且正在运行，开始雨滴
		startRain();
	}
}

// 设置速度
function setSpeed(speed) {
	rainSpeed = speed;
}

// 设置大小
function setSize(size) {
	rainSize = size;
}

// 设置密度
function setDensity(density) {
	rainDensity = density;
	
	// 如果正在运行，重新设置间隔
	if (isRunning && isEnabled) {
		startRain();
	}
}

// 设置随机颜色
function setRandomColor(value) {
	randomColor = value;
	
	if (randomColor && !randomColorInterval) {
		// 启动随机颜色变化
		randomColorInterval = setInterval(() => {
			// 这里不做任何事情，因为每个雨滴都会在创建时获取随机颜色
		}, 1000);
	} else if (!randomColor && randomColorInterval) {
		// 停止随机颜色变化
		clearInterval(randomColorInterval);
		randomColorInterval = null;
	}
}

// 重置所有设置
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

// 开始生成雨滴
function startRain() {
	stopRain(); // 先停止现有的
	
	if (!isEnabled) return; // 如果禁用，不启动
	
	// 设置间隔 (密度越高，间隔越短)
	const interval = Math.max(10, 210 - rainDensity);
	rainInterval = setInterval(addDollar, interval);
}

// 停止生成雨滴
function stopRain() {
	if (rainInterval) {
		clearInterval(rainInterval);
		rainInterval = null;
	}
}

// 监听来自 Vue 应用的消息
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

// 初始化
startRain();

// 导出函数供 Vue 应用使用
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