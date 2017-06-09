/* 原生console 原型链拼接 */
class SuperConsole {
	constructor() {

	}
}
SuperConsole.prototype = window.console;


export default class Console extends SuperConsole {
	constructor() {
		super();
		window.console.log('origin console');
		this.originConsole = window.console;
		this.localConsoleData = []; //{type, content}
		this.outerEleId;
		this.updateTimer;

		/* 
		 * window.onerror 同样以console.error 输出
		 * 首次error前，window.onerror = null;
		 */
		let originOnerror = window.onerror;
		window.onerror = (msg, source, lineno, colno, error) => {
			/* 是否同源js 运行错误 */
			if (source) {
				console.error(`${msg}. in file: ${source}. in line ${lineno}`);
			} else {
				console.error('Script Error: 非同源javascript文件运行错误,查看控制台');
			}
			if (originOnerror) {
				try {
					originOnerror(msg, source, lineno, colno, error);
				} catch (e) {
					console.info('originOnerror 发生错误');
				}
			}
		}
		// 监听文件错误
		window.document.addEventListener("error", function (e) {
			var elem = e.target;
			switch(elem.tagName.toLowerCase()) {
				case 'img':
				case 'script': return window.console.error(`GET ${elem.src} 404`);
				case 'link': return window.console.error(`GET ${elem.href}`);
				default: return;
			}
		}, true /*指定事件处理函数在捕获阶段执行*/);

		/* 替换 */
		window.console = this;
	}

	set consoleData(arr) {
		this.localConsoleData = arr;
		if (document.getElementById('fc_console_dom')) {
			// 节流，
			window.clearTimeout(this.updateTimer);
			this.updateTimer = setTimeout(() => {
				this.updateConsoleDOMList();
			}, 50)
		}
	}


	renderDOM(eleId) {
		//  组织console模块 html结构 
		this.outerEleId = eleId;
		let consoleDOM = document.createElement('div');
		consoleDOM.id = 'fc_console_dom'
		consoleDOM.innerHTML = `<div id='fc_console_header'><a id='fc_console_clear'></a><a class="fc_console_select">All</a><a>Error</a><a>warn</a><a>Info</a><a>Log</a></div><ul id='fc_console_container'></ul>`;

		// 渲染出去并插入 console 数据
		document.getElementById(eleId).innerHTML = consoleDOM.outerHTML;
		this.updateConsoleDOMList();

		// 渲染后绑定 nav click 事件
		setTimeout(() => {
			let consoleHeader = document.getElementById('fc_console_header');
			let aList = consoleHeader.getElementsByTagName('a');
			consoleHeader.addEventListener('click', (e) => {
				for (let len = aList.length, i = 0; i < len; i++) {
					aList[i].removeAttribute('class');
				}
				e.target.className = 'fc_console_select';
				let text = e.target.innerText;
				if (e.target.id == 'fc_console_clear') {
					return this.clear();
				}
				if (text == 'All') {
					return this.updateConsoleDOMList();
				}
				return this.updateConsoleDOMList(text.toLowerCase());
			})
		})
	}
	/* 不增加data， 只更新dom */
	updateConsoleDOMList(selectType) {
		let innerHTML = this.localConsoleData.map(({ type, content }) => {
			if (!selectType || selectType == type) {
				return `<li class=${type}><span>> [${type}]</span><label>${content}</label></li>`;
			}
		}).join('');
		document.getElementById('fc_console_container').innerHTML = innerHTML;
	}
	/* 增加data */
	updateConsoleData(type, content) {
		let strArr = content.map(item => {
			// 判断是不是html元素
			if (item && item.parentElement) {
				return ToHtmlString(item.outerHTML);
			}
			switch (typeof item) {
				case 'undefined': return 'undefined';
				case 'object': return JSON.stringify(item);
				default: return item;
			}
		}).join(' ');
		this.consoleData = [...this.localConsoleData, { type, content: strArr }]
	}
	log(...content) {
		this.originConsole.log(...content);
		this.updateConsoleData('log', content);
	}
	info(...content) {
		this.originConsole.info(...content);
		this.updateConsoleData('info', content);
	}
	debug(...content) {
		this.originConsole.debug(...content);
		this.updateConsoleData('debug', content);
	}
	warn(...content) {
		this.originConsole.warn(...content);
		this.updateConsoleData('warn', content);
	}
	error(...content) {
		this.originConsole.error(...content);
		this.updateConsoleData('error', content);
	}
	clear() {
		this.consoleData = [];
	}
}


//Html结构转字符串形式显示 支持<br>换行
function ToHtmlString(htmlStr) {
	return toTXT(htmlStr).replace(/\&lt\;br[\&ensp\;|\&emsp\;]*[\/]?\&gt\;|\r\n|\n/g, '');
}
//Html结构转字符串形式显示
function toTXT(str) {
	var RexStr = /\<|\>|\"|\'|\&| |　/g
	str = str.replace(RexStr,
		function (MatchStr) {
			switch (MatchStr) {
				case "<":
					return "&lt;";
				case ">":
					return "&gt;";
				case "\"":
					return "&quot;";
				case "'":
					return "&#39;";
				case "&":
					return "&amp;";
				case " ":
					return "&ensp;";
				case "　":
					return "&emsp;";
				default:
					break;
			}
		}
	)
	return str;
}


