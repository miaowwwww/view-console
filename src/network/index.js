let myXHR;

export default class Network {
	constructor() {
		this.xhrData = []; //name, status, method, timing, resUrl, params, body, 
		this.networkContainerId;
		this.xhrUpdateTimer;

		window.XMLHttpRequest.prototype.open = openReplacement;
		window.XMLHttpRequest.prototype.send = sendReplacement;

		myXHR = this;
	}

	renderDOM(eleId) {
		this.networkContainerId = eleId;

		let networkDOM = document.createElement('div');
		networkDOM.id = 'fc_network_dom';
		/* resource */
		let resourceDOM = document.createElement('div');
		resourceDOM.id = 'fc_resource_dom';
		let resourceHTML = this.getResourceHTML();
		resourceDOM.innerHTML = `<h1>Resource Timing</h1><ul>${resourceHTML}</ul>`;

		/* xhr */
		let xhrDOM = document.createElement('div');
		xhrDOM.id = 'fc_xhr_dom';
		xhrDOM.innerHTML = `<h1>XMLHttpRequest</h1>`;
		let xhrContainer = document.createElement('ul');
		xhrContainer.id = 'fc_xhr_container';
		xhrContainer.innerHTML = this.xhrData.map(this.makeXhrLiHtml).join('');
		/* 监听li 的点击事件 */
		xhrContainer.addEventListener('click', (e) => {
			let currLi = e.path.find(item => {
				if (item.tagName == 'LI') {
					return true;
				}
			})
			let index = currLi.getAttribute('data-index');

			/* 渲染详情页 */
			this.renderXHRDetail(this.xhrData[index]);
		})

		xhrDOM.appendChild(xhrContainer);

		networkDOM.appendChild(resourceDOM);
		networkDOM.appendChild(xhrDOM);

		let constainer = document.getElementById(eleId);
		constainer.innerHTML = '';
		constainer.appendChild(networkDOM);

	}
	/* xhr */
	makeXhrLiHtml(item, index) {
		let li = (item) => item.xhrError ? `<li class='fc_xhr_error' data-index=${index}>` : `<li data-index=${index}>`;
		return `${li(item)}<span>${item.name}</span><span>${item.status}</span><span>${item.method}</span><span>${item.timing}ms</span><small>${item.resUrl}</small></li>`
	}
	addXHRData(xhr) {
		this.xhrData.push(xhr);
		// 节流
		window.clearTimeout(this.xhrUpdateTimer);
		this.xhrUpdateTimer = setTimeout(() => {
			let xhrContainer = document.getElementById('fc_xhr_container');
			if (!xhrContainer) {
				return;
			}
			xhrContainer.innerHTML = this.xhrData.map(this.makeXhrLiHtml).join('');
		}, 50);
	}
	/* xhr select */
	renderXHRDetail(_xhr) {
		let xhrDetailDOM = document.createElement('div');
		xhrDetailDOM.id = 'fc_xhrDetail_dom';
		xhrDetailDOM.innerHTML = this.makeXHRDetailHTML(_xhr);
		// 绑定返回事件
		xhrDetailDOM.addEventListener('click', (e) => {
			if (e.target.className != 'fc_back') {
				return;
			}
			xhrDetailDOM.remove();
		})
		// let container = document.getElementById(this.networkContainerId)
		let container = document.getElementById('fc_network_dom');
		container.appendChild(xhrDetailDOM);

	}
	makeXHRDetailHTML(xhr) {
		return `<header><i class='fc_back'></i><small>[${xhr.method}]${xhr.resUrl}</small></header><section><h1>Request</h1><ul><li class="fc_xhrdetail_url"><span>URL:</span>${xhr.resUrl}</li><li><span>Method:</span>${xhr.method}</li><li><span>Params:</span><p>${ xhr.params}</p></li></ul></section><section><h1>Response</h1><ul><li><span>StatusCode:</span>${xhr.status}</li><li><span>Body:</span><p>${xhr.body}</p></li></ul></section>`
	}
	/* resource */
	getResourceHTML() {
		let resources = window.performance.getEntries();
		let resourceHTMLArr = [];
		for (let len = resources.length, i = 0; i < len; i++) {
			let item = resources[i];
			if (this.isResource(item.initiatorType)) {
				let data = this.mapResourceToData(item);
				let _html = this.makeResourceLiHTML(data);
				resourceHTMLArr.push(_html);
			}
		}
		return resourceHTMLArr.join('');
	}
	isResource(initiatorType) {
		switch (initiatorType) {
			case 'script':
			case 'css':
			case 'link':
			case 'img': return true;
			default: return false;
		}
	}
	mapResourceToData(resource) {
		let name = getUrlName(resource.name);
		let timing = Math.ceil(resource.responseEnd - resource.requestStart);
		let url = resource.name;
		return { name, timing, url };
	}
	makeResourceLiHTML(item) {
		return `<li><span>${item.name}</span><span>${item.timing}ms</span><small>${item.url}</small></li>`
	}

}



function getParams(str) {
	let paramsStr = str.split('?')[1];
	if (!paramsStr) {
		return '';
	}
	let params = {};
	let keyValue = paramsStr.split('&');
	for (let item of keyValue) {
		let kv = item.split('=');
		params[kv[0]] = kv[1];
	}
	return JSON.stringify(params);
}
function getUrlName(str) {
	let index = str.lastIndexOf(`/`);
	let name = str.substring(index + 1);
	return name;
}


// XMLHttpRequest ie7+,
let send = window.XMLHttpRequest.prototype.send;
let open = window.XMLHttpRequest.prototype.open;

function openReplacement(method, url, ...rest) {
	let timeStart = 0;
	let timeEnd = 0;
	this.addEventListener('loadstart', () => {
		timeStart = Date.now();
	});
	this.addEventListener('loadend', () => {
		/* 判断请求是否错误 */
		if (this.status > 400 || this.status < 200) {
			console.error(`${method} ${url} ${this.status} (${this.statusText})`);
			this.xhrError = true;
		}

		timeEnd = Date.now();
		let timing = timeEnd - timeStart;
		let params;
		if (method.toLowerCase() == 'get') {
			params = getParams(url);
		}
		else if (typeof this.sendData == 'string') {
			params = this.sendData;
		} else {
			params = this.sendData ? JSON.stringify(this.sendData) : '';
		}

		/* 
		 * name, status, method, timing, resUrl, params, body, 
		 * */

		myXHR.addXHRData({
			name: getUrlName(url),
			status: this.status,
			method,
			timing,
			resUrl: this.responseURL || url,
			params,
			xhrError: this.xhrError,
			body: this.responseText,
		});

	});
	return open.apply(this, [method, url, ...rest])
}

function sendReplacement(sendData) {
	this.sendData = sendData;
	return send.call(this, sendData);
}



