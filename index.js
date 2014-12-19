
//var obj = 
//{
//    a: 1,
//    b:
//    {
//        A: 100,
//        B: 'aaa',
//        C: true
//    },
//    c:
//    {
//        A: undefined,
//        B: null
//    },
//    d:
//    {
//        A: [0, 1, 2, 3],
//        B: String('hi'),
//        C: Boolean(true),
//        D: new Date(),
//        E: Number(123)
//    }
//};


MiniQuery.use('$');



var QueryString = (function()
{
    var url = location.search.replace('?', '');
    return $.Object.parseQueryString(url);
})();


/**
* 去掉 innerText / innerHTML 中的无用字符
*/
String.prototype.trimSpace = function()
{
    return this.replaceAll('&amp;', '&').replaceAll(' ', '').replaceAll('\n', '');
};

String.prototype.cut = function(maxLength)
{
    if(!maxLength)
    {
        maxLength = UI.MaxContentLength;
    }
    
    if(this.length > maxLength)
    {
        return this.substring(0, maxLength) + ' ……';
    }
    
    return this;
};


/**
 * 用做过滤直接放到HTML里的
 * @return {String}
 */
String.prototype.escHtml = function()
{
	return this.replace(/[&'"<>\/\\\-\x00-\x09\x0b-\x0c\x1f\x80-\xff]/g, function(r)
						{
							return "&#" + r.charCodeAt(0) + ";"
						})
				.replace(/ /g, "&nbsp;")
				.replace(/\r\n/g, "<br />")
				.replace(/\n/g, "<br />")
				.replace(/\r/g, "<br />");
};



var Parser = 
{   
};

Parser.Object = 
{
    toHtml: function(obj)
    {
        var innerHTML = document.body.innerHTML;
        
        var leaf = $.String.between(innerHTML, '<!--TPL.Leaf', 'TPL.Leaf-->'); 
        var combined = $.String.between(innerHTML, '<!--TPL.Combined', 'TPL.Combined-->');
        
        var htmls = [];
        
        for(var name in obj)
        {
            var value  = obj[name];
            
            switch(typeof value)
            {
                case 'string':
                case 'boolean':
                case 'number':
                    htmls.push($.String.format(leaf, 
                    {
                        'name': Parser.Dom.setData(name),
                        'value': Parser.Dom.setData(value)
                    }));
                    break;
                case 'object':
                    
                    var combinedValue = $.Object.toQueryString(value);
                    
                    htmls.push($.String.format(combined, 
                    {
                        'name': Parser.Dom.setData(name),
                        'combinedValue': Parser.Dom.setData(combinedValue),
                        'value': arguments.callee(value)
                    }));
                    
                    break;
            }
        }
        
        return htmls.join('');
    }
};



Parser.Dom = 
{
    
    getData: function(td)
    {
        var data = td.getAttribute('data');
        return decodeURIComponent(data);
    },
    
    setData: function(td, data)
    {
        if(td.nodeType === undefined)   //此时调用方式为 Parser.Dom.setData(data);  //即获取编码值
        {
            data = td;
            return encodeURIComponent(data);
        }
        
        td.setAttribute('data', encodeURIComponent(data));
    },
    
    /**
    * 解析某个 dom 元素 (如 table) 成等价结构的对象
    */
    toObject: function(table)
    {
        var obj = {};
        
        var name_value = (function(table)
        {
            var fnSelf = arguments.callee;
            
            if(table.className == 'leafTable')
            {
                var name = Parser.Dom.getData(table.rows[0].cells[0]);
                var value = Parser.Dom.getData(table.rows[0].cells[1]);
                return [name, value];
            }
            
            if(table.className == 'combinedTable')
            {
                var name = Parser.Dom.getData(table.rows[0].cells[0]);
                var value = {};
                
                $.Array(table.rows[1].cells[0].children).each(function(item, index)
                {
                    var name_value = fnSelf(item);
                    value[name_value[0]] = name_value[1];
                });
                
                return [name, value];
            }
                
           
        })(table);
        
        var name = name_value[0];
        var value = name_value[1];
        
        obj[name] = value;
        
        return obj;
    },
    
    setHtml: function(node, obj)
    {
        var divDom = document.getElementById('divDom');
        
        if(node.nodeType === undefined) //此时相当于 setHtml(obj)
        {
            obj = node;
            node = divDom;
        }
        
        node.innerHTML = Parser.Object.toHtml(obj); //浏览器解析 html 并生成 dom 树有一定延迟
        setTimeout(function()
        {
            divDom.firstElementChild.rows[0].cells[0].id = 'tdRoot';
            var tdRoot = divDom.firstElementChild.rows[0].cells[0];
            tdRoot.setAttribute('id', 'tdRoot');
            tdRoot.ondblclick = function()
            {
                UI.toggleDomRoot(tdRoot);
            };
            
            $.Array(divDom.getElementsByTagName('td')).map(function(td, index)
            {
                var className = td.className;
                
                return  className == 'leafValue' || className == 'leafName'  || 
                        className == 'combinedValue' || className == 'combinedName' ? 
                            td : null;
            }).each(function(td, index)
            {
                var data = Parser.Dom.getData(td);
                var textNode = document.createTextNode(data.cut());
                td.replaceChild(textNode, td.firstChild);
            });
            
        }, 0);
        
    },
    
    encode: function(txt)
    {
        var td = txt.parentNode;
        
        var data = Parser.Dom.getData(td);
        var value = txt.value;

        if(data == value)   //数据没有修改
        {
            UI.toNormal(txt);
            return;
        }
        
        txt.onblur = null;  //避免触发 onblur 事件的绑定
        
        this.isChanged = true;  // Parser.Dom.isChanged = true;
        Parser.Dom.setData(td, value);
        
        
        
        if(td.className == 'combinedValue') //处理的是复合结点
        {
            if(value.indexOf('=') > 0)
            {
                var obj = $.Object.parseQueryString(value);
                var table = td.parentNode.parentNode.parentNode;
                Parser.Dom.setHtml(table.rows[1].cells[0],  obj);
            }
            else
            {
                var name = Parser.Dom.getData(td.previousElementSibling);
                var obj = {};
                obj[name] = value;
                
                //创建一个临时的 td 以解析和存放新的 obj   
                var tmpTd = document.createElement('td');
                Parser.Dom.setHtml(tmpTd, obj);
                var newTable = tmpTd.firstElementChild;
                var oldTable = td.parentNode.parentNode.parentNode;
                oldTable.parentNode.replaceChild(newTable, oldTable);
                
            }
        }
        else if(td.className == 'leafValue' && value.indexOf('=') > 0)
        {
            var name = Parser.Dom.getData(td.previousElementSibling);
            var obj = {};
            obj[name] = $.Object.parseQueryString(value);
            
            var oldTable = td.parentNode.parentNode.parentNode;

            //创建一个临时的 td 以解析和存放新的 obj   
            var tmpTd = document.createElement('td');
            Parser.Dom.setHtml(tmpTd, obj);
            
            var newTable = tmpTd.firstElementChild;
            
            oldTable.parentNode.replaceChild(newTable, oldTable);
            
        }
    },
    
    apply: function(fnCallback)
    {
        if(!this.isChanged)
        {
            fnCallback && fnCallback();
            return;
        }
        
        
        setTimeout(function()
        {
            var divDom = document.getElementById('divDom');
            //把 dom 转成对应的 json 相当费时
            var obj = Parser.Dom.toObject(divDom.children[0]); //根据 dom 取得最终的等价对象(新修改的值已保存在dom在)
            Parser.Dom.setHtml(divDom, obj);  //把对象转成 html，以把局部修改最终应用到所有父节点
            
            fnCallback && fnCallback();
            
        }, 0);
        
        this.isChanged = false;
    }
    
    
};






var UI = 
{
    MaxContentLength: 150,   //显示的最大长度
    
    toEdit: function(td)
    {
        if(td.innerHTML.indexOf('<input') >=0)
        {
            return;
        }
        
        var value = Parser.Dom.getData(td);
        
        td.innerHTML = $.String.format('<input type="text" onblur="UI.toNormal(this)" onchange="Parser.Dom.encode(this)" onkeyup="UI.showCalender(this, event)" value="{value}" class="text" />', 
        {
            value: value.escHtml()
        });
        
        td.children[0].focus();
    },
    
    toNormal: function(txt)
    {
        if(txt.isCalenderVisible)
        {
            return;
        }
        
        var td = txt.parentNode;
        var value = txt.value;
        
        var textNode = document.createTextNode(value.cut());
        td.replaceChild(textNode, txt);
        
    },
    
    moveUp: function(a)
    {
        var table = a.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
        var previous = table.previousElementSibling;
        table.parentNode.insertBefore(table, previous);
        setTimeout(function()
        {
            table.rows[0].cells[0].firstElementChild.style.display = '';
        }, 0);
        
        Parser.Dom.isChanged = true;
    },
    
    moveDown: function(a)
    {
        var table = a.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
        var next = table.nextElementSibling;
        if(next) //还没到最后
        {
            table.parentNode.insertBefore(next, table);
        }
        else
        {
            var first = table.parentNode.firstElementChild;
            table.parentNode.insertBefore(table, first);
        }
        
        setTimeout(function()
        {
            table.rows[0].cells[0].firstElementChild.style.display = '';
        }, 0);
        
        Parser.Dom.isChanged = true;
        
    },
    
    remove: function(a)
    {
        var ok = confirm('你确认要删除该节点吗?');
        if(!ok)
        {
            return false;
        }
        
        var table = a.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
        table.parentNode.removeChild(table);
        
        Parser.Dom.isChanged = true;
    },
    
    add: function(a)
    {
        var table = a.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
        
        var a = table.rows[1].cells[0].lastElementChild.rows[0].cells[0].firstElementChild.children[4].firstElementChild;
        
        var ok = UI.clone(a);
        if(ok === false)
        {
            return false;
        }
        
        
        var newTable = table.rows[1].cells[0].lastElementChild; //该 table 是新克隆的
        var td = newTable.rows[0].cells[1];
        Parser.Dom.setData(td, '');
        td.firstChild.data = '';    //文本节点
        
        UI.toEdit(td);
        
        
        Parser.Dom.isChanged = true;
    },
    
    clone: function(a)
    {
        var name = prompt('请输入新名称', (function()
        {
            var td = a.parentNode.parentNode.parentNode;
            var name = Parser.Dom.getData(td);
            
            var parts = name.split('.');
            var main = parts[0];
            var chars = main.split('');
            
            var prefixs = $.Array(chars).map(function(c, index)
            {
                if( isNaN(parseInt(c, 10)) )
                {
                    return c;
                }
                
                return null;
            }).value;
            
            var numbers = $.Array(main.split('')).map(function(c, index)
            {
                if( isNaN(parseInt(c, 10)) )   //是一个 NaN
                {
                    return null;    //扔掉
                }
                
                return c;
            }).value;
            
            parts[0] = '';  //清空
            
            return $.String.format('{prefix}{index}{suffix}',
            {
                prefix: prefixs.join(''),
                index: numbers.length > 0 ? (parseInt(numbers.join(''), 10) + 1).toString(10).padLeft(numbers.length, '0') : '',
                suffix: parts.join('.')
            });
            
        })());
        
        
        
        if(!name)
        {
            return false;
        }
        
        
        var table = a.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
        
        var isValid = true;
        
        $.Array(table.parentNode.children).each(function(item, index)
        {
            if(Parser.Dom.getData(item.rows[0].cells[0]) == name)
            {
                isValid = false;   
                return false; //break;
            }
        });
        
        if(!isValid)
        {
            alert('已存在同名称的节点');
            return false;
        }
        
        
        var newTable = table.cloneNode(true);
        var td = newTable.rows[0].cells[0];
        
        Parser.Dom.setData(td, name);
        td.childNodes[0].data = name; // 设置TextNode的内容
        
        table.parentNode.appendChild(newTable);
        
        Parser.Dom.isChanged = true;
    },
    
    rename: function(a)
    {
        var td = a.parentNode.parentNode.parentNode;
        
        var oldName = Parser.Dom.getData(td);
        var newName = prompt('请输入新名称', oldName);
        if(!newName || newName == oldName)
        {
            return;
        }
        
        
        var table = a.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
        var isValid = true;
        
        $.Array(table.parentNode.children).each(function(item, index)
        {
            if(Parser.Dom.getData(item.rows[0].cells[0]) == newName)
            {
                isValid = false;   
                return false; //break;
            }
        });
        
        if(!isValid)
        {
            alert('已存在同名称的节点');
            return;
        }
        
        Parser.Dom.setData(td, newName);
        td.childNodes[0].data = newName;
        
        Parser.Dom.isChanged = true;
    },
    
    /*改值。暂时不用*/
    revalue: function(a)
    {
        var td = a.parentNode.parentNode.parentNode.nextElementSibling;
        td.style.display = 'block';
        this.toEdit(td);
        
        Parser.Dom.isChanged = true;
    },
    
    showMenu: function(td)
    {
        var divDom = td.parentNode.parentNode.parentNode.parentNode;
        if(divDom && divDom.id == 'divDom')   //单击的是 '参数列表' 的单元格，忽略它
        {
            return;
        }
        
        td.firstElementChild.style.display = td.firstElementChild.style.display == 'none' ? '' : 'none';
    },
    
    showCalender: function(txt, event)
    {
        function CtrlAltKey(e, sKey)
        {
	        return e.ctrlKey && e.altKey && e.keyCode == sKey.charCodeAt(0);
        }

        try
	    {
		    var e = event || window.event;
		    if (CtrlAltKey(e, "T"))
		    {
		        var o = txt;
		        txt.isCalenderVisible = true;   //指示日历已给调出
    		    
			    if(txt.value.match(/^[0-9]*$/))
	            {
		            calendar(o, calendar.FMT.UNIXTIMESTAMP);
	            }
	            else if(txt.value.match(/^\d{4}-\d{2}-\d{2}/))
	            {
		            calendar(o, calendar.FMT.DATETIME);
	            }
		    }
	    }
	    catch(ex)
	    {
	        alert(ex);
	    }
    },
    
    toggleDomRoot: function(tdRoot)
    {
        var table = tdRoot.parentNode.parentNode.parentNode;
        var td = table.rows[1].cells[0];
        var display = td.style.display == 'none' ? '' : 'none';
        
        var isVisible = td.style.display == '';
        if(isVisible)
        {
            $.Object.extend(tdRoot.style, 
            {
                fontWeight: 'bold',
                width: '100px'
            });
            
            td.style.display =  'none';
        }
        else
        {
            $.Object.extend(tdRoot.style, 
            {
                fontWeight: 'normal',
                width: '10px'
            });
            td.style.display =  '';
        }
        
        
    },
    
    
    toggleCombinedValue: function(a)
    {
        a = a || document.getElementById('ID_toggleCombinedValue');
        
        var isVisible = a.innerHTML.indexOf('显示') >= 0;
        a.innerHTML = isVisible ? a.innerHTML.replace('显示', '隐藏') : a.innerHTML.replace('隐藏', '显示');
        
        var display = isVisible ? '' : '.combinedValue{display: none;}';
        
        var id = 'styleCombinedValue';
        var css = document.getElementById(id);
        if(!css)
        {
            css = document.createElement('style');
            css.setAttribute('id', id);
            css.setAttribute('type', 'text/css');
            css.innerHTML = display;
            document.getElementsByTagName('head')[0].appendChild(css);
        }
        else
        {
            css.innerHTML = display;
        }
    },
    
    toggleCurrentCombinedValue: function(a)
    {
        var td = a.parentNode.parentNode.parentNode.nextElementSibling;
        var isVisible = a.innerHTML.indexOf('显示') >= 0;
        var display = isVisible ? 'block' : 'none';
        a.innerHTML = isVisible ? a.innerHTML.replace('显示', '隐藏') : a.innerHTML.replace('隐藏', '显示');
        td.style.display = display;
        
    }
};


Parser.Json = 
{
    setText: function()
    {
        var divDom = document.getElementById('divDom');
        var td = divDom.children[0].rows[0].cells[1];
        var newData = Parser.Dom.getData(td);
        var obj = $.Object.parseQueryString(newData);
            
        var txt = document.getElementById('txtJson');
        txt.value = $.Object.toJSON(obj);

    },
    
    parseText: function()
    {
        var txt = document.getElementById('txtJson');
        var name = 'root';
        var json = $.String.format('window["{name}"] = {value};', 
        {
            name: name,
            value: txt.value
        });
        
        try
        {
            eval(json);
            var obj = window[name];
            Parser.Dom.setHtml(
            {
                '参数列表': obj
            });
            
        }
        catch(e)
        {
            alert(e);
        }
    },
    
    replaceValues: function()
    {
        var txt = document.getElementById('txtJson');
        var name = 'root';
        var json = $.String.format('window["{name}"] = {value};', 
        {
            name: name,
            value: txt.value
        });
        
        try
        {
            eval(json);
            var nameValues = window[name];
            for(var n in nameValues)
            {
                if(typeof nameValues[n] == 'object')
                {
                    alert('名称-值对集合中不能包含复合结构');
                    return;
                }
            }
            
            var divDom = document.getElementById('divDom');
            var td = divDom.children[0].rows[0].cells[1];
            var newData = Parser.Dom.getData(td);
            var obj = $.Object.parseQueryString(newData);
            
            $.Object.replaceValues(obj, nameValues);
            
            Parser.Dom.setHtml(
            {
                '参数列表': obj
            });
            
        }
        catch(e)
        {
            alert(e);
        }
    }
};

//--------------------------------------------------------------------------------------------------------------------
//开始
(function()
{
    
        var node = {};
        node.data = 'a=1&b=2&c=A%3D100%26B%3D200';
        var obj = $.Object.parseQueryString(node.data || 'a=');    //递归解析 node.data 的字符串成一个等价的对象
        
        Parser.Dom.setHtml(
        {
            '参数列表': obj
        });
        
    
    
})();