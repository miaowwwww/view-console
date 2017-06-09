export default class Element {
    renderDOM(eleId) {
        // 创建element 模块 html结构
        let elementDOM = document.createElement('div');
        elementDOM.id = 'fc_element_dom';
        // 切换展开状态
        elementDOM.addEventListener('click', function (e) {
            if (e.target.tagName == 'DIV') {
                return;
            }
            let parent = e.target;
            let next = e.target.nextSibling;
            if (next && next.tagName == 'DIV') {
                let currDisplay = next.style.display;
                next.style.display = currDisplay == 'block' ? 'none' : 'block';
            }
            let currClassName = parent.className;
            parent.className = (/fc_element_select/gi).test(currClassName) ? 'fc_element_parent' : 'fc_element_parent fc_element_select';
        })

        // 获取innerhtml 结构
        let ele = document.getElementsByTagName('html')[0];
        let elementData = this.getAllElement(ele);
        let elementHTML = this.makeItemHtml(elementData);

        elementDOM.innerHTML = elementHTML;

        // 渲染Element到容器
        let container = document.getElementById(eleId);
        container.innerHTML = '';
        container.appendChild(elementDOM);

    }

    makeItemHtml(node) {
        let { parent, children } = node;
        if (children.length > 0) {
            let childrenHTML = children.map(child => {
                return this.makeItemHtml(child);
            }).join('');
            return `<p class='fc_element_parent' type='haschild'>${parent}</p><div class='fc_element_children'>${childrenHTML}</div>`;
        }
        return `<p class='fc_element_parent'>${parent}</p>`;
    }

    getAllElement(node) {
        let root = {};
        // 文本节点
        if (node.nodeType == 3) {
            root.parent = `content: ${node.nodeValue}`;
            root.children = [];
        }
        // 元素节点
        if (node.nodeType == 1) {
            root.parent = `${node.tagName.toLowerCase()}${node.className && '.' + node.className.replace(' ', '.')}`;
            root.children = [];
            let child = node.childNodes || [];
            for (let len = child.length, i = 0; i < len; i++) {
                let node = this.getAllElement(child[i]);
                if (node) root.children.push(node);
            }
        }
        if ((/\S/ig).test(node.nodeValue) && node.nodeType != 8) {
            return root;
        }
    }
}

