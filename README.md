# view-console
for mobile

# 继承
prototype 与 __proto__ 的区别
```
Person.prototype == person.__proto__ || person.[[prototype]]
//构造函数使用 == 实例使用（注意，浏览器屏蔽__proto__，google，firefox暴露出来）
```
# console
1. 使用自己的Console覆盖原生window.console,   
2. 并把原生console设置为Console.prototype.\__proto\__，用以填充没有覆盖的属性、方法，(放弃这个方法，选择在Console在添加一层class，防止 \__proto\__ 不兼容)  
使用setter监听数据更新
```js
Console:{log, info, error, warn, debug, clear}  
```
3. 如何获取静态资源加载错误的信息？  不会冒泡，但可以捕获
    方法：遍历dom获取所有的img，link，script，新建一个，设置监听器，注意不需要插入dom。
```
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
        //存在问题。link加载错误，即使在chrome也不会报错
    ```
4. window.onerror 
```
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
```
# window.onerror 
捕捉网页中的错误，在error首次出现之前，window.onerror = null;
* javascript运行错误，会触发window.onerror
* img、link、script资源加载错误, 会触发该ele.onerror, 一般不会冒泡到，只有firefox会冒泡得window
* 同源的js运行错误function(msg, source, lineno, colno, error)
* 非同源js运行错误， 只有简单msg:'Script error.'.
* 在开发环境中是用 devServer，在html发生error能得到完整参数，但在js文件中，同样判定为非同源，只有"Script error."

# network
1. window.performance.getEntries( )， 只有成功的请求才可以通过该接口得到包括，js，css，img，xhr, link, ps: 走file协议的都不可以通过该接口得到
2. 封装xmlHttpRequest以及fetch，可以得到所有的异步请求，但是没有资源得请求数据

# sources
1. window.performance.getEntries(), 获取所有加载成功的资源,兼容ie9+

# element
* 树结构
```js
const item = {  
    parent//当前元素的名字，属性text，body.className:  body.main,
    children // children item 指针
}
```
* 方法：  
    1. 每一次点击element Item，就获取一次 html 结构的快照，得到整个html结构，好处：不需要添加过多的事件监听，以及绑定多个只想html 元素的的变量（本次使用）  
    2. 在我html列表 和 真实dom，建立一一对应关系。  
        1. 每一次html列表的 li，创建的时候绑定onclick事件，并使用闭包保存对应的真实dom元素的指针。  
        2. 每一个html列表的 li 在创建插入之前绑定一个特别的属性，该属性指向真实dom的对应元素  

1. node.childNodes 可以获取nodeType == 1||3||8
2. 使用了递归的方式遍历元素以及制造html，数据量大了，会出现调用栈溢出的问题。可通过外部调用的方法解决。ps:es6尾调用优化已经解决该问题

# other
1. overflow 字体需要使用white-space: nowrap;
2. 例如console和xhr这种，每增加一条就需要更新html，可以使用节流的方式。防止过多的刷新。
3. transform 兼容性在ie9+
4. 若文本为连续的长字符串，需要用word-wrap: break-word; 换行，兼容ie10+
5. 如何判断变量是不是html元素？ 通过是否含有特定属性/方法。本次使用ele.parentElement,所以document.documentElement判断为false
6. flexbox: 兼容性ie10+,android2.3+,iso4+,winphone8+  


# 使用方法：  
1. 在body元素下添加fast-console.js，并且是body的第一个子元素
