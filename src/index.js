import './assets/css/reset';
import './assets/css/index';
// import './assets/font/font';
import Console from './console';
import Element from './element';
import Network from './network';

class FastConsole {
	constructor() {
		this.domOpen = false;
		this.tooltipOpen = false;
	}

	init() {
		this.myConsole = new Console();
		this.myElement = new Element();
		this.myNetwork = new Network();

		this.renderTooltip();
	}

	/* 渲染小图标 */
	renderTooltip() {
		let tooltip = document.createElement('div');
		tooltip.id = 'fc_tooltip';
		tooltip.innerHTML = "<span class='fc_icon_tooltip' data-type='setting'></span>" + 
							"<span class='fc_icon_console' data-type='Console'></span>" +
							"<span class='fc_icon_element' data-type='Element'></span>" +
							"<span class='fc_icon_network' data-type='Network'></span>";
		tooltip.addEventListener('click', (e) => {
			// 判断是否关闭dom
			if(this.domOpen) {
				this.domOpen = false;
				tooltip.removeAttribute('class');
				return document.getElementById('fc_dom').remove();
			}

			// 切换 icon 类型 ；添加 fc_tootip_open 类
			this.tooltipOpen = !this.tooltipOpen;
			if (this.tooltipOpen) {
				return tooltip.className = 'fc_tooltip_open';
			}
			tooltip.removeAttribute('class');

			// 是否选择了某一个类型
			let type = e.target.getAttribute('data-type');
			if(type == 'setting') {
				return;
			}
			tooltip.className = 'fc_tooltip_opening';
			this.domOpen = true;
			this.renderDOM(type);

		})

		document.body.appendChild(tooltip);
	}
	/* 渲染DOM */
	renderDOM(type) {
		let fcDOM = document.createElement('div');
		fcDOM.id = 'fc_dom';

		// 根据type创建innerHTML
		let nav = document.createElement('nav');
		nav.id = 'fc_nav';
		let nav_innerHTML = `<a ${type == 'Console' ? "class='fc_nav_select'" : ''}>Console</a><a ${type == 'Network' ? "class='fc_nav_select'" : ''}>Network</a><a ${type == 'Element' ? "class='fc_nav_select'" : ''}>Element</a>`;
		nav.innerHTML = nav_innerHTML;
		let that = this;
		nav.addEventListener('click', function (e) {
			let aList = this.getElementsByTagName('a');
			for (let len = aList.length, i = 0; i < len; i++) {
				aList[i].removeAttribute('class');
			}
			e.target.className = 'fc_nav_select';
			return that.selectToRender(e.target.innerText);
		});


		let fcContainer = document.createElement('div');
		fcContainer.id = 'fc_container';

		fcDOM.appendChild(nav);
		fcDOM.appendChild(fcContainer);

		document.body.appendChild(fcDOM);

		// 渲染选择的类型
		this.selectToRender(type)
	}

	selectToRender(type) {
		switch (type) {
			case "Console": return this.myConsole.renderDOM('fc_container');
			case "Element": return this.myElement.renderDOM('fc_container');
			case "Network": return this.myNetwork.renderDOM('fc_container');
			default: return alert('error to select type to render, click again');
		}
	}
}


// const fastConsole = new FastConsole();
// fastConsole.renderTooltip();
new FastConsole().init();