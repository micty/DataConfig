

//最后更新：2012-05-26



(function(window, undefined)
{




/**
* MinQuery 壳构造器
*/
function MiniQuery(selector, context)
{
    return new MiniQuery.prototype.init(selector, context);
}

MiniQuery.prototype = 
{
    //修正构造器的引用
    constructor: MiniQuery,
    
    // 真正的 MiniQuery 构造器
    init: function(selector, context) 
    {
        //处理 $(function)，即 $(document).ready(function);
        if(typeof selector == 'function')
        {
            return MiniQuery(document).ready(selector);
        }
        
        //处理 $(""), $(null), 或 $(undefined) 的情况
        if(!selector)
        {
            this.length = 0;
            return this;
        }
        
        //处理 $(DOMElement) 的情况
        if(selector.nodeType)
        {
            this.context = this[0] = selector;
            this.length = 1;
            return this;
        }
        

        // body 元素只存在一个，用最优的方式找到它
        if (selector === "body" && !context && document.body) 
        {
	        this.context = document;
	        this[0] = document.body;
	        this.length = 1;
	        return this;
        }
        
        
        this.length = 0;
        this.context = (function()
        {
            if(context instanceof MiniQuery && context.length > 0)
            {
                return context.get(0);
            }
            return (context && context.nodeType) ? context : document;
        })();
        
//        this.context = (context instanceof MiniQuery && context.length > 0) ? context.get(0) :
//            (context && context.nodeType) ? context : document;
        
        
        if(typeof selector == 'string')
        {
            if(selector.charAt(0) === '#') // 处理 $('#ID')
            {
                this[0] = document.getElementById(selector.substring(1));
                this.length = 1;
            }
            else if(selector.indexOf('.') < 0 && selector.indexOf('#') < 0)
            {
                var nodes = MiniQuery.Array.parse( this.context.getElementsByTagName(selector) );
                Array.prototype.push.apply(this, nodes);
            }
        }
        else if(selector instanceof Array)
        {
            for(var i=0, len=selector.length; i<len; i++)
            {
                var node = selector[i];
                if(node && node.nodeType)
                {
                    this[this.length++] = node;
                }
            }
        }
    },
    
    length: 0,
    selector: '',
    
    /**
    * 用一个或多个其他对象来扩展 MiniQuery.prototype 对象，返回当前的 this 对象。
    */
    extend: function(obj)
    {
        for(var name in obj)
        {
            this[name] = obj[name];
        }
        return this;
    },
    
    /**
    * 对此 MiniQuery 实例的每个 DOM 元素执行指定的操作。
    * 只有在回调函数中明确返回 false 才停止循环(相当于 break)。
    * 在回调函数中的 this 就指向了要处理的 DOM 元素，第一个参数是该 DOM 元素的索引值
    */
    each: function(fnCallback)
    {
        for(var i=0; i<this.length; i++) //this.length是一个非实时属性，可不缓存
        {
            //在回调函数中的 this 就指向了要处理的 dom 元素，
            //并且只有在回调函数中明确返回 false 才会退出循环
            if(fnCallback.call(this[i], i) === false)   
            {
                break;
            }
        }
        
        return this;
    },
    
    /**
    * 以数组的形式检索 MiniQuery 集中包含的所有 DOM 元素。
    */
    toArray: function()
    {
        return Array.prototype.slice.call(this, 0);
    },
    
    /**
    * 获取 MiniQuery 对象中元素的个数。
    * 这个函数的返回值与 MiniQuery 对象的'length' 属性一致。
    */
    size:function()
    {
        return this.length;
    },
    
    get: function(index)
    {
        if(index >= 0 && index < this.length)
        {
            return this[index];
        }
        
        if(index < 0 && index + this.length >= 0)
        {
            return this[index + this.length];
        }
        
        if(index == null)  // undefined 或 null
        {
            return this.toArray();
        }
    }
};

//修正原型的引用
MiniQuery.prototype.init.prototype = MiniQuery.prototype;





/**
* 用一个其他对象来扩展 MiniQuery 对象，返回当前的 MiniQuery 对象。
*/
MiniQuery.extend = function(obj)
{
    for(var name in obj)
    {
        this[name] = obj[name];
    }
    return this;
};


MiniQuery.extend(
{
    /**
    * 定义一个针对 MiniQuery 的全局名称，可用作当前运行时确定的标识符。
    */
    expando: 'MiniQuery' + String(Math.random()).replace(/\D/g, ''),
    
    
    /**
    * 运行这个函数将变量 $ 的控制权让渡给第一个实现它的那个库。
    * 这有助于确保 MiniQuery 不会与其他库的 $ 对象发生冲突。
    * 在运行这个函数后，就只能使用 MiniQuery 变量访问 MiniQuery 对象。
    * 注意:这个函数必须在你导入MiniQuery文件之后，并且在导入另一个导致冲突的库之前使用。
    * 当然也应当在其他冲突的库被使用之前，除非 MiniQuery 是最后一个导入的。
    */
    noConflict: function(newSpacename, isDeep)
    {
        var argsCount = arguments.length;
        
        if(argsCount == 0) // MiniQuery.noConflict()
        {
            window.$ = _$; //恢复原来的 $
        }    
        else if(argsCount == 1)
        {
            if(typeof newSpacename == 'string' && window.$ === MiniQuery) // MiniQuery.noConflict(name)
            {
                window.$ = _$; //恢复原来的 $
                window[newSpacename] = MiniQuery; //设置新名称
            }
            else if(newSpacename === true && window.MiniQuery === MiniQuery) // MiniQuery.noConflict(true)
            {
                window.MiniQuery = _MiniQuery; //恢复原来的 MiniQuery
            }
        }
        else if(argsCount == 2) // MiniQuery.noConflict(name, true)
        {
            window.$ = _$; //恢复原来的 $
            window[newSpacename] = MiniQuery; //设置新名称
            
            if(isDeep && window.MiniQuery === MiniQuery)
            {
                window.MiniQuery = _MiniQuery; //恢复原来的 MiniQuery
            }
        }
        
        
        return MiniQuery;
    },
    
    error: function(msg)
    {
        throw new Error(msg);
    },
    
    each: function(data, fnCallback)
    {
        if(data instanceof Array && data.length > 0)
        {
            MiniQuery.Array.each(data, fnCallback);
        }
        else if(typeof data == 'object' && data)
        {
            MiniQuery.Object.each(data, fnCallback);
        }
    },
    
    now: function() 
    {
		return (new Date()).getTime();
	},
	
	//定义一个空函数
	noop: function()
	{
	}
	
});


/***********************************************************************************************************
* 对象工具
*/

MiniQuery.Object = function(obj)
{
    return new MiniQuery.Object.prototype.init(obj);
};





/**
* 用一个或多个其他对象来扩展一个对象，返回被扩展的对象。
* 
* 如果参数为空，则返回 null；
* 如果只有一个参数，则直接返回该参数；
* 否则：把第二个参数到最后一个参数的成员拷贝到第一个参数对应中去，并返回第一个参数。
* 如果被拷贝的对象是一个数组，则直接拷贝其中的元素。
*/
MiniQuery.Object.extend = function()
{
    var len = arguments.length;
    if(len == 0)
    {
        return null;
    }
    
    var target = arguments[0];
    if(len == 1)
    {
        return target;
    }
    
    for(var i=1; i<len; i++)
    {
        var obj = arguments[i];
        
        if(obj instanceof Array) //数组
        {
            for(var index=0, size=obj.length; index < size; index++)
            {
                target[index] = obj[index];
            }
        }
        else
        {
            for(var name in obj)
            {
                target[name] = obj[name];
            }
        }

        
    }

    return target;
};



MiniQuery.Object.extend( MiniQuery.Object, 
{
    /**
    * 用一个或多个其他对象来扩展一个对象，返回被扩展的对象。
    * 该方法会删除值为 null 或 undefined 的成员。
    * 如果参数为空，则返回 null；
    * 如果只有一个参数，则直接返回该参数；
    * 否则：把第二个参数到最后一个参数的成员拷贝到第一个参数对应中去，并返回第一个参数。
    * 如果被拷贝的对象是一个数组，则直接拷贝其中的元素。
    */
    extendTrim: function()
    {
        var len = arguments.length;
        if(len == 0)
        {
            return null;
        }
        
        var target = MiniQuery.Object.trim(arguments[0]);
        if(len == 1)
        {
            return target;
        }
        
        for(var i=1; i<len; i++)
        {
            var arg = arguments[i];
            
            if(arg instanceof Array) //数组
            {
                var array = MiniQuery.Array.trim(arg);
                
                for(var index=0, size=array.length; index < size; index++)
                {
                    target[index] = array[index];
                }
            }
            else
            {
                var obj = MiniQuery.Object.trim(arg);
                
                for(var name in obj)
                {
                    target[name] = obj[name];
                }
            }

            
        }

        return target;
    },
    
    /**
    * 递归地删除对象的成员中值为 null 或 undefined 的成员。
    * 当指定 isShallow 为 true 时，则不进行递归。
    */
    trim: function(obj, isShallow)
    {
        for(var name in obj)
        {
            var value = obj[name];
            if(value == null) //null 或 undefined
            {
                delete obj[name]; //注意，这里不能用 value
            }
            
            if(typeof value == 'object' && !isShallow) //递归
            {
                arguments.callee(value);
            }
        }
        
        return obj;
    },
    
    /**
    * 对象迭代器。
    * 只有在回调函数中明确返回 false 才停止循环
    */
    each: function(obj, fnCallback)
    {       
        for(var name in obj)
        {
            if(fnCallback(name, obj[name]) === false) // 只有在 fnCallback 中明确返回 false 才停止循环
            {
               break;
            }
        }
    },
    
    /**
    * 对象映射转换器。返回一个新的对象
    */
    map: function(obj, fn)
    {
        var target = {};
        
        for(var key in obj)
        {
            target[key] = fn(obj[key], key);
        }
        
        return target;
    },
    
    /**
    * 把一个对象转成 JSON 字符串
    */
    toJson: function(obj)
    {
        if(obj == null) // null 或 undefined
        {
            return String(obj);
        }
        
        switch(typeof obj)
        {
            case 'string':
                return "'" + obj + "'";
            case 'number':
            case 'boolean':
                return obj;
            case 'function':
                return obj.toString()
        }
        
        //处理包装类和日期
        if(obj instanceof String || obj instanceof Number || obj instanceof Boolean || obj instanceof Date)
        {
            return arguments.callee(obj.valueOf());
        }
        
        //处理正则表达式
        if(obj instanceof RegExp)
        {
            return arguments.callee(obj.toString());
        }
        
        //处理数组
        if(obj instanceof Array)
        {
            var list = [];
            for(var i=0, len=obj.length; i<len; i++)
            {
                list.push(arguments.callee(obj[i]));
            }
            
            return '[' + list.join(', ') + ']';
        }
        
        var pairs = [];
        for(var name in obj)
        {
            pairs.push("'" + name + "': " + arguments.callee(obj[name])); 
        }
        return '{ ' + pairs.join(', ') + ' }';
    },
    
    /**
    * 把 JSON 字符串解析成一个 Object 对象
    */
    parseJson: function(data)
    {
        if (typeof data !== "string" || !data) 
	    {
		    return null;
	    }
	    
	    data = MiniQuery.String.trim(data);
	    
	    if (window.JSON && window.JSON.parse) //标准方法
	    {
		    return window.JSON.parse(data);
	    }
	     
	    var rvalidchars = /^[\],:{}\s]*$/,
	        rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
	        rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
	        rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
	    
	    data = data.replace(rvalidescape, '@')
	               .replace(rvalidtokens, ']' )
	               .replace(rvalidbraces, '');
	    
	    if (!rvalidchars.test(data)) 
		{
		    throw new Error('非法的 JSON 数据: ' + data);
	    }
	    
	    return (new Function('return ' + data ))();
    },
    
    /**
    * 用一组指定的名称-值对中的值去替换指定名称对应的值。
    * 当指定第三个参数为 true 时，将进行第一层次的搜索与替换，否则替换所有同名的成员为指定的值
    */
    replaceValues: function(target, nameValues, isShallow)
    {
        for(var key in target)
        {
            var val = target[key];
            switch(typeof val)
            {
                case 'string':
                case 'number':
                case 'boolean':
                    for(var name in nameValues)
                    {
                        if(key == name)
                        {
                            target[key] = nameValues[name];
                            break;
                        }
                    }
                    break;
                case 'object':
                    !isShallow && arguments.callee(val, nameValues);
                    break;
            }
        }
        return target;
    },
    
    /*
     * 把一个 Object 对象中的值按给定的名称的顺序转成一个数组。
     * 
     */
    toArray: function(obj, names)
    {
        if(names === undefined)
        {
            var a = [];
            for(var i in obj)
            {
                a.push(obj[i]);
            }
            return a;
        }
        
        return names.map(function(item, index)
        {
            return obj[item];
        });
    },
    
    
    /**
    * 把一个对象的名称-值对转成用指定分隔符连起来的字符串
    */
    toString: function(nameValues, innerSeparator, pairSeparator)
    {
        innerSeparator = innerSeparator || '=';
        pairSeparator = pairSeparator || '&';
        
        var pairs = [];
        for(var name in nameValues)
        {
            pairs.push(name + innerSeparator + nameValues[name]);
        }
        
        return pairs.join(pairSeparator);
    },
    
    /**
    * 把一个对象编码成等价结构的 Url 查询字符串。
    * 当指定第二个参数为 true 时，将使用 escape 来编码；否则使用 encodeURIComponent。
    */
    toQueryString: function(obj, isCompatible)
    {
        if(obj == null)     // null 或 undefined
        {
            return String(obj);
        }

        
        switch(typeof obj)
        {
            case 'string':
            case 'number':
            case 'boolean':
                return obj;
        }
        
        if(obj instanceof String || obj instanceof Number || obj instanceof Boolean || obj instanceof Date)
        {
            return arguments.callee(obj.valueOf());
        }
        
        if(obj instanceof Array)
        {
            return '[' + obj.join(', ') + ']';
        }
        
        var fn = isCompatible ? escape : encodeURIComponent;
        
        var pairs = [];
        for(var name in obj)
        {
            pairs.push(name + '=' + fn(arguments.callee(obj[name]))); 
        }
        
        return pairs.join('&');
    },
    
    /*
    * 把 Url 中的查询字符串解析为等价结构的对象。
    * 当显式指定第二个参数为 true 时，则使用浅层次来解析(只解析一层，不进行递归解析)。
    * 当指定第三个参数为 true 时，将使用 escape 来编码；否则使用 encodeURIComponent。
    */
    parseQueryString: function(url, isShallow, isCompatible)
    {
        var fn = isCompatible ? unescape : decodeURIComponent;
        
        var obj = {};
        
        var pairs = url.split('&');
        for(var i=0, len=pairs.length; i<len; i++)
        {
            var name_value = pairs[i].split('=');
            
            if(name_value.length > 1)
            {
                var name = name_value[0];
                var value = isShallow ? name_value[1] : fn(name_value[1]); 
                
                if(!isShallow)  //深层次解析
                {
                    if(value.indexOf('=') > 0) //还出现=号，说明还需要进一层次解码
                    {
                        value = arguments.callee(value); //递归调用
                    }
                }
                
                obj[name] = value;
            }
        }
        
        return obj;
    },
 
    /*
    * 深度克隆一个对象
    */
    clone: function(obj)
    {
        if(obj === null || obj === undefined)
        {
            return obj;
        }
        
        //处理值类型，直接返回相应的包装类
        var type = typeof obj;
        
        var Wrappers = 
        {
            'string': String,
            'number': Number,
            'boolean': Boolean
        };
        
        if(Wrappers[type])
        {
            return new Wrappers[type](obj);
        }
        
        
        var target = {};
        
        for(var name in obj)
        {
            var value = obj[name];
            
            switch(typeof value)
            {
                case 'string':
                case 'number':
                case 'boolean':
                case 'function':
                    target[name] = value;
                    break;
                case 'object':
                    target[name] = arguments.callee(value);   //递归调用
                    break;
                default:
                    target[name] = undefined;
                    break;
            }
        }
        
        return target; 
    },
    
    

    /*
    * 检测对象是否是空对象(不包含任何属性)。
    * 方法既检测对象本身的属性，也检测从原型继承的属性(因此没有使用hasOwnProperty)。
    */
    isEmpty: function(obj)
    {
        for (var name in obj) 
        {
            return false;
        }
        
        return true;
    },
    
    /**
    * 一个简单的方法来判断一个对象是否为 window 窗口
    */
    isWindow: function(obj)
    {
        return obj && typeof obj == 'object' && 'setInterval' in obj;
    },
    
    
    /**
    * 判断一个对象是否是纯粹的对象（通过 "{}" 或者 "new Object" 创建的）。
    */
    isPlain: function(obj)
    {
        if(!obj || typeof obj != 'object' || obj.nodeType || MiniQuery.Object.isWindow(obj))
        {
            return false;
        }
        
        try 
	    {
		    // Not own constructor property must be Object
		    if (obj.constructor && 
		        !Object.prototype.hasOwnProperty.call(obj, "constructor") && 
		        !Object.prototype.hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf") ) 
			{
			    return false;
		    }
	    } 
	    catch ( e ) 
	    {
		    // IE8,9 Will throw exceptions on certain host objects #9897
		    return false;
	    }

	    // Own properties are enumerated firstly, so to speed up,
	    // if last one is own, then all properties are own.
	    var key;
	    for ( key in obj ) 
	    {
	    }

	    return key === undefined || Object.prototype.hasOwnProperty.call(obj, key);
    },
    
    /**
    * 判断一个对象是否为值类型。
    * 即 typeof 的结果是否为 string、number、boolean 中的一个。
    */
    isValueType: function(obj)
    {
        return (/^(string|number|boolean)$/g).test(typeof obj);
    },
    
    /**
    * 判断一个对象是否为包装类型
    */
    isWrappedType: function(obj)
    {
        var types = [String, Number, Boolean];
        for(var i=0, len=types.length; i<len; i++)
        {
            if(obj instanceof types[i])
            {
                return true;
            }
        }
        
        return false;
    },
    
    /**
    * 判断一个对象是否为内置类型
    */
    isBuiltinType: function(obj)
    {
        var types = [String, Number, Boolean, Array, Date, RegExp, Function];
        
        for(var i=0, len=types.length; i<len; i++)
        {
            if(obj instanceof types[i])
            {
                return true;
            }
        }
        
        return false;
    }
    
    
    
    
    
});



//----------------------------------------------------------------------------------------------------------------
//包装类的实例方法

MiniQuery.Object.prototype = 
{
    constructor: MiniQuery.Object,
    value: {},
    
    init: function(obj)
    {
        this.value = Object(obj);
    },
    
    valueOf: function()
    {
        return this.value;
    },
    
    extend: function()
    {
        //其实是想执行 MiniQuery.Object.extend(this.value, arguments[0], arguments[1], …);
        var args = [this.value];
        args = args.concat( Array.prototype.slice.call(arguments, 0) );
        this.value = MiniQuery.Object.extend.apply(null, args);
        return this;
    },
    
    extendTrim: function()
    {
        //其实是想执行 MiniQuery.Object.extendTrim(this.value, arguments[0], arguments[1], …);
        var args = [this.value];
        args = args.concat( Array.prototype.slice.call(arguments, 0) );
        this.value = MiniQuery.Object.extendTrim.apply(null, args);
        return this;
    },
    
    trim: function(isShallow)
    {
        this.value = MiniQuery.Object.trim(this.value, isShallow);
        return this;
    },
    
    each: function(fn)
    {
        MiniQuery.Object.each(this.value, fn);
        return this;
    },
    
    map: function(fn)
    {
        this.value = MiniQuery.Object.map(this.value, fn);
        return this;
    },
    
    toJson: function(obj)
    {
        return MiniQuery.Object.toJson(this.value);
    },
    
    parseJson: function(data)
    {
        this.value = MiniQuery.Object.parseJson(data);
        return this;
    },
    
    replaceValues: function(nameValues, isShallow)
    {
        this.value = MiniQuery.Object.replaceValues(this.value, nameValues, isShallow);
        return this;
    },
    
    toArray: function(names)
    {
        return MiniQuery.Object.toArray(this.value, names);
    },
    
    toString: function(innerSeparator, pairSeparator)
    {
        return MiniQuery.Object.toString(this.value, innerSeparator, pairSeparator);
    },
    
    toQueryString: function(isCompatible)
    {
        return MiniQuery.Object.toQueryString(this.value, isCompatible);
    },
    
    parseQueryString: function(url, isShallow, isCompatible)
    {
        this.value = MiniQuery.Object.parseQueryString(url, isShallow, isCompatible);
        return this;
    },
    
    clone: function()
    {
        return MiniQuery.Object.clone(this.value);
    },
    
    isEmpty: function()
    {
        return MiniQuery.Object.isEmpty(this.value);
    },
    
    isWindow: function()
    {
        return MiniQuery.Object.isWindow(this.value);
    },
    
    isPlain: function()
    {
        return MiniQuery.Object.isPlain(this.value);
    },
    
    isValueType: function()
    {
        return MiniQuery.Object.isValueType(this.value);
    },
    
    isWrappedType: function()
    {
        return MiniQuery.Object.isWrappedType(this.value);
    },
    
    isBuiltinType: function()
    {
        return MiniQuery.Object.isBuiltinType(this.value);
    }
};

MiniQuery.Object.prototype.init.prototype = MiniQuery.Object.prototype;


/***********************************************************************************************************
* 数组工具
*/

MiniQuery.Array = function(array)
{
    return new MiniQuery.Array.prototype.init(array);
};





MiniQuery.Object.extend( MiniQuery.Array,  
{
    /**
    * 对此数组实例的每个元素执行指定的操作。
    * 只有在 fn 中明确返回 false 才停止循环(相当于 break)。
    * 如果给 isReversed 指定 true，则使用倒序来进行循环迭代；否则按正序。
    */
    each: function(array, fn, isReversed)
    {
        var len = array.length;
        
        if(isReversed === true) //使用反序。根据<<高性能 JavaScript>>的论述，这种循环性能可以比 else 中的提高 50% 以上
        {
            for(var i=len; i--; ) //这里只能用后减减，而不能用前减减，因为这里是测试条件，先测试，再减减
            {
                //如果用 callback.call(array[i], i)，
                //则在 callback 中的 this 就指参数中的 array[i]，但类型全部为 object
                if(fn(array[i], i) === false) // 只有在 fn 中明确返回 false 才停止循环
                {
                   break;
                }
            }
        }
        else
        {
            for(var i=0; i<len; i++)
            {
                if(fn(array[i], i) === false)
                {
                   break;
                }
            }
        }
        
        return array;
    },
    
    /**
    * 把一个对象转成数组。
    * 如果未指定第二个参数为 true，并且该对象：
        1.为 undefined 
        2.或 null 
        3.或不是对象
        4.或该对象不包含 length 属性
        5.或 length 为 0
        
        则返回空数组；
      否则：
        使用 for in 来枚举该对象并填充到一个新数组中然后返回该数组。
    */
    parse: function(obj, useForIn)
    {
        if(obj instanceof Array) // 本身就是数组
        {
            return obj;
        }
        
        
        var a = [];
        
        if(useForIn === true) //没有 length 属性，或者不方便使用 length，则使用 for in
        {
            for(var name in obj)
            {
                if(name === 'length') //忽略掉 length 属性
                {
                    continue;
                }
                
                a.push(obj[name]);
            }
            return a;
        }
        
        
        if(!obj || !obj.length) //参数非法
        {
            return [];
        }
        
        
        
        try //标准方法
        {
            a = Array.prototype.slice.call(obj, 0);
        }
        catch(ex)
        {
            for(var i=0, len=obj.length; i<len; i++)
            {
                a.push( obj[i] );
            }
        }
        
        return a;
    },
    
    /**
    * 把一个数组转成 Object 对象，从而得到一个类数组的对象（arguments 就是这样的对象）。
    * 如果参数非法，则返回 null；否则把数组的元素拷贝到一个新的 Object 对象上并返回它。
    */
    toObject: function(array)
    {
        if(!array || !(array instanceof Array))
        {
            return null;
        }
        
        var len = array.length;
        var obj = 
        {
            length: len
        };
        
        for(var i=0; i<len; i++)
        {
            obj[i] = array[i];
        }
        
        return obj;
    },
    
    /**
    * 将一个数组中的元素转换到另一个数组中，返回一个新数组。
    * 作为参数的转换函数会为每个数组元素调用，而且会给这个转换函数传递一个表示被转换的元素和该元素的索引作为参数。
    * 转换函数可以返回转换后的值：
    *   null：删除数组中的项目；
    *   undefined：删除此项目到数组最后一个元素
    */
    map: function(array, fn)
    {
        var a = [];
        
        for(var i=0, len=array.length; i<len; i++)
        {
            var value = fn(array[i], i);
            
            if(value === null)
            {
                continue;
            }
            
            if(value === undefined)
            {
                break;
            }
            
            a.push(value);
        }
        
        return a;
    },
    
    /**
    * 使用过滤函数过滤数组元素，返回一个新数组。
    * 此函数至少传递两个参数：待过滤数组和过滤函数。过滤函数必须返回 true 以保留元素或 false 以删除元素。
    * 转换函数可以返回转换后的值：
    */
    grep: function(array, fn)
    {
        var a = [];
        
        for(var i=0, len=array.length; i<len; i++)
        {
            var item = array[i]
            
            if(fn(item, i) === true)
            {
                a.push(item);
            }
        }
        
        return a;
    },
    
    /**
    * 检索特定的元素在数组中第一次出现的索引位置。
    * 如果不存在该元素，则返回 -1。
    */
    indexOf: function(array, item)
    {
        if(typeof array.indexOf == 'function')
        {
            return array.indexOf(item);
        }
        
        for(var i=0, len=array.length; i<len; i++)
        {
            if(array[i] === item)
            {
                return i;
            }
        }
        
        return -1;  
    },
    
    /**
    * 判断数组中是否包含特定的元素，返回 true 或 false。
    */
    contains: function(array, item)
    {
        return MiniQuery.Array.indexOf(array, item) > -1;
    },
    
    /**
    * 从数组中删除特定的元素，返回一个新数组。
    */
    remove: function(array, target)
    {
        return MiniQuery.Array.map(array, function(item, index)
        {
            return target === item ? null : item;
        });
    },
    
    /**
    * 从数组中删除特定索引位置的元素，返回一个新数组。
    */
    removeAt: function(array, index)
    {
        if(index < 0 || index >= array.length)
        {
            return array.slice(0);
        }
        
        return MiniQuery.Array.map(array, function(item, i)
        {
            return index === i ? null : item;
        });
    },
    
    /**
    * 批量合并数组，返回一个新数组。
    */
    merge: function()
    {
        var a = [];
        
        for(var i=0, len=arguments.length; i<len; i++)
        {
            var arg = arguments[i];
            if(arg === undefined)
            {
                continue;
            }
            
            a = a.concat(arg);
        }
        
        return a;
    },
    
    /**
    * 批量合并数组，并删除重复的项，返回一个新数组。
    */
    mergeUnique: function()
    {
        var list = [];
        
        var argsLen = arguments.length;
        for(var index=0; index<argsLen; index++)
        {
            var arg = arguments[index];
            var len = arg.length;
            
            for(var i=0; i<len; i++)
            {
                if(!MiniQuery.Array.contains(list, arg[i]))
                {
                    list.push(arg[i]);
                }
            }
        }
        
        return list;
    },
    
    /**
    * 给数组删除（如果已经有该项）或添加（如果还没有项）一项，返回一个新数组。
    */
    toggle: function(array, item)
    {
        if(MiniQuery.Array.contains(array, item))
        {
            return MiniQuery.Array.remove(array, item);
        }
        else
        {
            var list = array.slice(0);
            list.push(item);
            return list;
        }
    },
    
    
    /**
    * 查找符合条件的单个元素的索引，返回第一次找到的元素的索引值，否则返回 -1。
    * 只有在回调函数中明确返回 true，才算找到。
    */
    findIndex: function(array, fn, startIndex)
    {
        startIndex = startIndex || 0;
        
        for(var i=startIndex, len=array.length; i<len; i++)
        {
            if(fn(array[i], i) === true) // 只有在 fn 中明确返回 true 才停止循环
            {
                return i;
            }
        }
        
        return -1;
    },
    
    /**
    * 查找符合条件的单个元素，返回第一次找到的元素，否则返回 null。
    * 只有在回调函数中中明确返回 true 才算是找到。
    */
    findItem: function(array, fn, startIndex)
    {
        startIndex = startIndex || 0;
        
        for(var i=startIndex, len=array.length; i<len; i++)
        {
            var item = array[i];
            if(fn(item, i) === true) // 只有在 fn 中明确返回 true 才算是找到
            {
                return item;
            }
        }
        
        return null;
    },
    
    /**
    * 对此数组的元素进行随机排序，返回一个新数组。
    */
    random: function(list)
    {
        var array = list.slice(0);
                
        for(var i=0, len=array.length; i<len; i++)
        {
            var index = parseInt(Math.random() * i);
            var tmp = array[i];
            array[i] = array[index];
            array[index] = tmp;
        }
        
        return array;
    },
    
    /**
    * 获取数组中指定索引位置的元素。
    * 如果传入负数，则从后面开始算起。如果不传参数，则返回一份拷贝的新数组。
    */
    get: function(array, index)
    {
        var len = array.length;
        
        if(index >= 0   &&   index < len)   //在常规区间
        {
            return array[index];
        }
        
        var pos = index + len;
        if(index < 0   &&   pos >= 0)
        {
            return array[pos];
        }
        
        if(index == null)  // undefined 或 null
        {
            return array.slice(0);
        }
    },
    
    /**
    * 删除数组中为 null 或 undefined 的项，返回一个新数组
    */
    trim: function(array)
    {
        return MiniQuery.Array.map(array, function(item, index)
        {
            return item == null ? null : item;  //删除 null 或 undefined 的项
        });
    },
    
    /**
    * 创建分组，即把转成二维数组。返回一个二维数组。
    * 当指定第三个参数为 true 时，可在最后一组向右对齐数据。
    */
    group: function(array, size, isPadRight)
    {
        var groups = MiniQuery.Array.slide(array, size, size);
        
        if(isPadRight === true)
        {
            groups[ groups.length - 1 ] = array.slice(-size); //右对齐最后一组
        }
        
        return groups;
    },
    
    /**
    * 用滑动窗口的方式创建分组，即把转成二维数组。返回一个二维数组。
    * 可以指定窗口大小和步长。步长默认为1。
    */
    slide: function(array, windowSize, stepSize)
    {
        if(windowSize >= array.length) //只够创建一组
        {
            return [array];
        }
        
        stepSize = stepSize || 1;
        
        var groups = [];
        
        for(var i=0, len=array.length; i<len; i=i+stepSize)
        {
            var end= i + windowSize;
            groups.push( array.slice(i, end) );
            if(end >= len)
            {
                break; //已达到最后一组
            }
        }
        
        return groups;
    },
    
    /**
    * 用圆形的方式截取数组片段，返回一个新的数组。
    * 即把数组看成一个首尾相接的圆圈，然后从指定位置开始截取指定长度的片段。
    */
    circleSlice: function(array, startIndex, size)
    {
        var a = array.slice(startIndex, startIndex + size);
        var b = [];
        
        var d = size - a.length;
        if(d > 0) //该片段未达到指定大小，继续从数组头部开始截取
        {
            b = array.slice(0, d);
        }
        
        return a.concat(b);
    },
    
    /**
    * 用圆形滑动窗口的方式创建分组，返回一个二维数组。
    * 可以指定窗口大小和步长。步长默认为 1。
    * 即把数组看成一个首尾相接的圆圈，然后开始滑动窗口。
    */
    circleSlide: function(array, windowSize, stepSize)
    {
        if(array.length < windowSize)
        {
            return [array];
        }
        
        stepSize = stepSize || 1;
        
        var groups = [];
        for(var i=0, len=array.length; i<len; i=i+stepSize)
        {
            groups.push( MiniQuery.Array.circleSlice(array, i, windowSize) );
        }
        
        return groups;
    }
});

//----------------------------------------------------------------------------------------------------------------
//包装类的实例方法

MiniQuery.Array.prototype = 
{
    constructor: MiniQuery.Array,
    value: [],
    
    init: function(array)
    {
        this.value = MiniQuery.Array.parse(array);
    },
    
    toString: function(separator)
    {
        separator = separator === undefined ? '' : separator;
        return this.value.join(separator);
    },
    
    valueOf: function()
    {
        return this.value;
    },
    
    each: function(fn, isReversed)
    {
        MiniQuery.Array.each(this.value, fn, isReversed);
        return this;
    },
    
    toObject: function()
    {
        return MiniQuery.Array.toObject(this.value);
    },
    
    map: function(fn)
    {
        this.value = MiniQuery.Array.map(this.value, fn);
        return this;
    },
    
    grep: function(fn)
    {
        this.value = MiniQuery.Array.grep(this.value, fn);
        return this;
    },
    
    indexOf: function(item)
    {
        return MiniQuery.Array.indexOf(this.value, item);
    },
    
    contains: function(item)
    {
        return MiniQuery.Array.contains(this.value, item);
    },
    
    remove: function(target)
    {
        this.value = MiniQuery.Array.remove(this.value, target);
        return this;
    },
    
    removeAt: function(index)
    {
        this.value = MiniQuery.Array.removeAt(this.value, index);
        return this;
    },
    
    merge: function()
    {
        //其实是想执行 MiniQuery.Array.merge(this.value, arguments[0], arguments[1], …);
        var args = [this.value];
        args = args.concat( Array.prototype.slice.call(arguments, 0) );
        this.value = MiniQuery.Array.merge.apply(null, args);
        return this;
    },
    
    mergeUnique: function()
    {
        //其实是想执行 MiniQuery.Array.mergeUnique(this.value, arguments[0], arguments[1], …);
        var args = [this.value];
        args = args.concat( Array.prototype.slice.call(arguments, 0) );
        this.value = MiniQuery.Array.mergeUnique.apply(null, args);
        return this;
    },
    
    toggle: function(item)
    {
        this.value = MiniQuery.Array.toggle(this.value, item);
        return this;
    },
    
    findIndex: function(fn, startIndex)
    {
        return MiniQuery.Array.findIndex(this.value, fn, startIndex);
    },
    
    findItem: function(fn, startIndex)
    {
        return MiniQuery.Array.findItem(this.value, fn, startIndex);
    },
    
    random: function()
    {
        this.value = MiniQuery.Array.random(this.value);
        return this;
    },
    
    get: function(index)
    {
        return MiniQuery.Array.get(this.value, index);
    },
    
    trim: function()
    {
        this.value = MiniQuery.Array.trim(this.value);
        return this;
    },
    
    group: function(size, isPadRight)
    {
        return MiniQuery.Array.group(this.value, size, isPadRight);
    },
    
    slide: function(windowSize, stepSize)
    {
        return MiniQuery.Array.slide(this.value, windowSize, stepSize);
    },
    
    circleSlice: function(startIndex, size)
    {
        this.value = MiniQuery.Array.circleSlice(this.value, startIndex, size);
        return this;
    },
    
    circleSlide: function(windowSize, stepSize)
    {
        return MiniQuery.Array.circleSlide(this.value, windowSize, stepSize);
    }
};

MiniQuery.Array.prototype.init.prototype = MiniQuery.Array.prototype;



/***********************************************************************************************************
*  Boolean 工具
*/

MiniQuery.Boolean = function(b)
{
    return new MiniQuery.Boolean.prototype.init(b);
};



MiniQuery.Object.extend( MiniQuery.Boolean,
{
    /**
    * 解析指定的参数为 boolean 值。
    * null、undefined、0、NaN、false、'' 及其相应的字符串形式会转成 false；
    * 其它的转成 true
    */
    parse: function(arg)
    {
        if(!arg) // null、undefined、0、NaN、false、''
        {
            return false;
        }
        
        if(typeof arg == 'string' || arg instanceof String)
        {
            var reg = /^(false|null|undefined|0|NaN)$/g;
            
            return !reg.test(arg);
        }

        
        return true;
    }
});


//----------------------------------------------------------------------------------------------------------------
//包装类的实例方法

MiniQuery.Boolean.prototype = 
{
    constructor: MiniQuery.Boolean,
    value: false,
    
    init: function(b)
    {
        this.value = MiniQuery.Boolean.parse(b);
    }
};


MiniQuery.Boolean.prototype.init.prototype = MiniQuery.Boolean.prototype;

/***********************************************************************************************************
*  日期时间工具
*/

MiniQuery.Date = function(date)
{
    return new MiniQuery.Date.prototype.init(date);
};


MiniQuery.Object.extend( MiniQuery.Date,
{
    now: function()
    {
        return new Date();
    },
    
    parse: function()
    {
        
    },
    
    /**
    * 把日期时间格式化指定格式的字符串。
    */
    format: function(datetime, formater)
    {
        var year = datetime.getFullYear();
        var month = datetime.getMonth() + 1;
        var date = datetime.getDate();
        var hour = datetime.getHours();
        var minute = datetime.getMinutes();
        var second = datetime.getSeconds();
        
        var padLeft = function(value, length)
        {
            return MiniQuery.String.padLeft(value, length, '0');
        };
        

        var isAM = hour <= 12;
        
        var map = 
        {
            'yyyy': padLeft(year, 4),
            'yy': String(year).substr(-2),
            'MM': padLeft(month, 2),
            'M': month,
            'dddd': '星期' + ('日一二三四五六'.charAt(datetime.getDay())),
            'dd': padLeft(date, 2),
            'd': date,
            'HH': padLeft(hour, 2),
            'H': hour,
            'hh': padLeft(isAM ? hour : hour - 12, 2),
            'h': isAM ? hour : hour - 12,
            'mm': padLeft(minute, 2),
            'm': minute,
            'ss': padLeft(second, 2),
            's': second,
            'tt': isAM ? 'AM' : 'PM',
            't': isAM ? 'A' : 'P',
            'TT': isAM ? '上午' : '下午',
            'T': isAM ? '上' : '下' 
        };
        
        var s = formater;
        
        for(var key in map)
        {
            s = MiniQuery.String.replaceAll(s, key, map[key]);
        }
        
        return s;
        
    },
    
    getFromServer: function(url, fnCallback)
    {
        var xhr = MiniQuery.XHR.create();
        
        xhr.onreadystatechange = function()
        {
            if (xhr.readyState == 4 && xhr.status == "200") 
            {
                var date = new Date(Date.parse( xhr.getResponseHeader("Date") ));
                fnCallback && fnCallback(date);
            }
        };
        
        xhr.open("GET", url, true);
        xhr.send(null);
        
    }
    
});



MiniQuery.Date.prototype = 
{
    constructor: MiniQuery.Date,
    value: new Date(),
    
    init: function(date)
    {
        this.value = Date(date);
    },
    
    valueOf: function()
    {
        return this.value.valueOf();
    },
    
    toString: function(formater)
    {
        return MiniQuery.Date.format(this.value, formater);
    },
    
    format: function(formater)
    {
        return MiniQuery.Date.format(this.value, formater);
    }
    
};

MiniQuery.Date.prototype.init.prototype = MiniQuery.Date.prototype;

/***********************************************************************************************************
*   数学工具
*/
MiniQuery.Math = 
{
    /**
    * 产生指定闭区间的随机整数。
    */
    randomInt: function(minValue, maxValue)
    {
        if(minValue === undefined && maxValue === undefined) // 此时为  Math.randomInt()
        {
            //先称除小数点，再去掉所有前导的 0，最后转为 number
            return Number(String(Math.random()).replace('.', '').replace(/^0*/g, ''));
        }
        else if(maxValue === undefined)
        {
            maxValue = minValue;    //此时相当于 Math.randomInt(minValue)
            minValue = 0;
        }
        
        var count = maxValue - minValue + 1;
        return Math.floor(Math.random() * count + minValue);
    },
    
    /**
    * 圆形求模方法。
    * 即用圆形链表的方式滑动一个数，返回一个新的数。
    * 可指定圆形链表的长度(size) 和滑动的步长(step)，滑动步长的正负号指示了滑动方向
    */
    slide: function(index, size, step)
    {
        step = step || 1; //步长默认为1
        
        index += step;
        if(index >= 0)
        {
            return index % size;
        }
        
        return (size - (Math.abs(index) % size)) % size;
    },
    
    /**
    * 下一个求模数
    */
    next: function(index, size)
    {
        return MiniQuery.Math.slide(index, size, 1);
    },
    
    /**
    * 上一个求模数
    */
    previous: function(index, size, step)
    {
        return MiniQuery.Math.slide(index, size, -1);
    },
    
    parseInt: function(string)
    {
        return parseInt(string, 10);
    }
};




/***********************************************************************************************************
*   函数工具
*/
MiniQuery.Function = 
{
    /**
    * 定义一个通用的空函数。
    * 实际使用中应该把它当成只读的，而不应该对它进行赋值。
    */
    empty: function()
    {
    },
    
    /**
    * 把函数绑定到指定的对象上，从而该函数内部的 this 指向该对象。
    * 返回一个新函数。
    */
    bind: function(obj, fn)
    {
        var args = Array.prototype.slice.call(arguments, 2);
        return function()
        {
            var args = args.concat( Array.prototype.slice.call(arguments, 0) );
            fn.apply(obj, args);
        }
    },
    
    /**
    * 间隔执行函数。
    * 该方法用 setTimeout 的方式实现间隔执行，可以指定要执行的次数。
    * 在回调函数中，会接收到当次执行次数。
    */
    setInterval: function(fn, delay, count)
    {
        var next = arguments.callee;
        next['count'] = (next['count'] || 0) + 1;
        
        setTimeout(function()
        {
            fn(next['count']);
            
            if(count === undefined || next['count'] < count) //未传入 count 或 未达到指定次数
            {
                next(fn, delay, count);
            }
            
        }, delay);

    }
    
    
};

/*
示例：

var foo = MiniQuery.Function.bind({}, function(a, b, c)
{
    console.log(a, b, c);
});

foo(1, 2);


*/



/***********************************************************************************************************
*   字符串工具
*/

MiniQuery.String = function(string)
{
    return new MiniQuery.String.prototype.init(string);
};



MiniQuery.Object.extend( MiniQuery.String, 
{
    /**
    * 用指定的值去填充一个字符串。
    * 当不指定字符串的填充标记时，则默认为 {}。
    */
    format: function(string, arg1, arg2)
    {
        var fn = arguments.callee;
        
        if(false) //该段代码永远不会被执行，只是用于显示用法
        {
            $.String.format('<%0%><%1%>',     ['<%', '%>'], ['a', 'b']           ); //#1 
            $.String.format('<%id%><%type%>', ['<%', '%>'], {id: 1, type: 'app'} ); //#2 
            $.String.format('{0}{1}',         ['a',   'b']  /*, undefined */     ); //#3 
            $.String.format('<%0%><%1%>',     ['<%', '%>'], 'a', 'b'             ); //#4 
            
            $.String.format('{id}{type}',     {id: 1, type: 'app'}               ); //#5 
            $.String.format('{2}{0}{1}',      'a', 'b', 'c'                      ); //#6 
        }
        
        if(arg1 instanceof Array) //#1 到 #4
        {
            if(arg2 instanceof Array) //#1
            {
                var tags = arg1;
                var list = arg2;
                
                var s = string;
                
                for(var i=0, len=list.length; i<len; i++)
                {
                    var sample = tags[0] + '' + i + tags[1]; // <%i%> 或 {i}
                    s = MiniQuery.String.replaceAll(s, sample, list[i]); // <%i%>  -->  list[i]
                }
                
                return s;
            }

            if(typeof arg2 == 'object')//#2
            {
                var tags = arg1;
                var nameValues = arg2;
                
                var s = string;
                for(var name in nameValues)
                {
                    var sample = tags[0] + name + tags[1];
                    s = MiniQuery.String.replaceAll(s, sample,  nameValues[name]);
                }
                
                return s;
            }
            
            if(arg2 === undefined) //#3
            {
                var tags = ['{', '}'];
                var list = arg1;
                return MiniQuery.String.format(string, tags, list);
            }
            
            //#4
            var args = Array.prototype.slice.call(arguments, 2);
            return fn(string, arg1, args);  //转到 #1
            
        } 
        else // #5 到 #6
        {
            if(typeof arg1 == 'object') //#5
            {
                return fn(string, ['{', '}'], arg1); //转到 #2
            }
            
            //#6
            var args = Array.prototype.slice.call(arguments, 1);
            return fn(string, ['{', '}'], args); //转到 #1
        }
        
    },
    
    /**
    * 对 Url 中的查询字符串进行合并，返回一个 Url 字符串。
    * 当在 queryStrings 参数的成员中指定 null 或 undefined 值，则删除原有的查询字符串中的对应项。
    */
    formatQueryString: function(url, queryStrings)
    {
        if(!queryStrings)
        {
            return url;
        }
        
        
        if(url.indexOf('?') < 0) //不包含 '?'
        {
            queryStrings = MiniQuery.Object.trim(queryStrings); //删除空白项
            return url + '?' + MiniQuery.Object.toQueryString(queryStrings);
        }
        
        var parts = url.split('?');
        var uri = parts[0];
        var search = parts[1];
        
        var olds = MiniQuery.Object.parseQueryString(search); //旧的参数
        
        var merged = MiniQuery.Object.extend(olds, queryStrings); //合并后的参数
        var news = MiniQuery.Object.trim(merged); //删除空白项
        
        return uri + '?' + MiniQuery.Object.toQueryString(merged);
    },

    /**
    * 对字符串进行全局替换
    */
    replaceAll: function(target, src, dest)
    {
        return target.split(src).join(dest);
    },
    
    /**
    * 从当前 String 对象移除所有前导空白字符和尾部空白字符。
    */
    trim: function(string)
    {
        return string.replace(/(^\s*)|(\s*$)/g, '');
    },
    
    /**
    * 从当前 String 对象移除所有前导空白字符。
    */
    trimStart: function(string)
    {
	    return string.replace(/(^\s*)/g, '');
    },

    /**
    * 从当前 String 对象移除所有尾部空白字符。
    */
    trimEnd: function(string)
    {
	    return string.replace(/(\s*$)/g, '');
    },
    
    /**
    * 把字符串按指定分隔符进行分裂，返回一个已移除的空白项的数组。
    * 当不指定分隔符时，默认为一个空格。
    */
    splitTrim: function(target, separator)
    {
        separator = separator || ' ';
        return MiniQuery.Array.map(target.split(separator), function(item, index)
        {
            return item == '' ? null : item;
        });
    },
    
    
    /**
    *  确定一个字符串的开头是否与指定的字符串匹配。
    */
    startsWith: function(str, dest, ignoreCase)
    {
        if(ignoreCase)
        {
            var src = str.substring(0, dest.length);
            return src.toUpperCase() === dest.toString().toUpperCase();
        }
        
        return str.indexOf(dest) == 0;
    },


    /**
    *  确定一个字符串的末尾是否与指定的字符串匹配。
    */
    endsWith: function(str, dest, ignoreCase)
    {
        var len0 = str.length;
        var len1 = dest.length;
        var delta = len0 - len1;
        
        
        if(ignoreCase)
        {
            var src = str.substring(delta, len0);
            return src.toUpperCase() === dest.toString().toUpperCase();
        }
        
        return str.lastIndexOf(dest) == delta;
    },
    
    /**
    * 确定一个字符串是否包含指定的子字符串。
    */
    contains: function(string, target)
    {
        return string.indexOf(target) > -1;    
    },
    
    
    /**
     * 右对齐此实例中的字符，在左边用指定的 Unicode 字符填充以达到指定的总长度。
     * 当指定的总长度小实际长度时，将从右边开始算起，做截断处理，以达到指定的总长度。
     */
    padLeft: function(string, totalWidth, paddingChar)
    {
        string = String(string); //转成字符串
        
        var len = string.length;
        if(totalWidth <= len) //需要的长度短于实际长度，做截断处理
        {
            return string.substr(-totalWidth); //从后面算起
        }
        
        paddingChar = paddingChar || ' ';
        
        var arr = [];
        arr.length = totalWidth - len + 1;
        

        return arr.join(paddingChar) + string;
    },

    /**
    * 左对齐此字符串中的字符，在右边用指定的 Unicode 字符填充以达到指定的总长度。
    * 当指定的总长度小实际长度时，将从左边开始算起，做截断处理，以达到指定的总长度。
    */
    padRight: function(string, totalWidth, paddingChar)
    {
        string = String(string); //转成字符串
        
        var len = string.length;
        if(len >= totalWidth)
        {
            return string.substring(0, totalWidth);
        }
        
        paddingChar = paddingChar || ' ';
        
        var arr = [];
        arr.length = totalWidth - len + 1;
        

        return string + arr.join(paddingChar);
    },
    
    
    /**
    * 转成骆驼命名法。
    * 如 font-size 转成 fontSize
    */
    toCamelCase: function(string) 
    {
        var rmsPrefix = /^-ms-/;
        var rdashAlpha = /-([a-z]|[0-9])/ig;
        
        return string.replace(rmsPrefix, 'ms-').replace(rdashAlpha, function(all, letter) 
        {          
		    return letter.toString().toUpperCase();
	    });
	    
	    /* 下面的是 mootool 的实现
	    return string.replace(/-\D/g, function(match)
	    {
			return match.charAt(1).toUpperCase();
		});
		*/
    },
    
    /**
    * 转成短线连接法。
    * 如 fontSize 转成 font-size
    */
    toHyphenate: function(string)
    {
		return string.replace(/[A-Z]/g, function(match)
		{
			return ('-' + match.charAt(0).toLowerCase());
		});
	},
	
	/**
    * 获取位于两个标记子串之间的子字符串。
    * 当获取不能结果时，统一返回空字符串。
    */
	between: function(string, tag0, tag1)
	{
	    var startIndex = string.indexOf(tag0);
	    if (startIndex < 0)
	    {
		    return '';
	    }
    	
	    startIndex += tag0.length;
    	
	    var endIndex = string.indexOf(tag1, startIndex);
	    if (endIndex < 0)
	    {
		    return '';
	    }
    	
	    return string.substr(startIndex,  endIndex - startIndex);
	},
	
	/**
    * 把一个字符串转成 UTF8 编码，返回一个编码码的新的字符串。
    */
	toUtf8: function(string)
    {
	    var encodes = [];
    	
	    MiniQuery.Array.each( string.split(''), function(ch, index)
	    {
		    var code = ch.charCodeAt(0);
            if (code < 0x80) 
            {
                encodes.push(code);
            }
            else if (code < 0x800) 
            {
                encodes.push(((code & 0x7C0) >> 6) | 0xC0);
                encodes.push((code & 0x3F) | 0x80);
            }
            else 
            {
                encodes.push(((code & 0xF000) >> 12) | 0xE0);
                encodes.push(((code & 0x0FC0) >> 6) | 0x80);
                encodes.push(((code & 0x3F)) | 0x80);
            }
	    });
    	
	    return '%' + MiniQuery.Array.map(encodes, function(item, index)
	    {
		    return item.toString(16);
	    }).join('%');
    }

});


//----------------------------------------------------------------------------------------------------------------
//包装类的实例方法

MiniQuery.String.prototype = 
{
    constructor: MiniQuery.String,
    value: '',
    
    init: function(string)
    {
        this.value = String(string);
    },
    
    toString: function()
    {
        return this.value;
    },
    
    valueOf: function()
    {
        return this.value;
    },
    
    format: function(arg1, arg2)
    {
        this.value = MiniQuery.String.format(this.value, arg1, arg2);
        return this;
    },
    
    formatQueryString: function(queryStrings)
    {
        this.value = MiniQuery.String.formatQueryString(this.value, queryStrings);
        return this;
    },
    
    replaceAll: function(src, dest)
    {
        this.value = MiniQuery.String.replaceAll(this.value, src, dest);
        return this;
    },
    
    trim: function()
    {
        this.value = MiniQuery.String.trim(this.value);
        return this;
    },
    
    trimStart: function()
    {
        this.value = MiniQuery.String.trimStart(this.value);
        return this;
    },
    
    trimEnd: function()
    {
        this.value = MiniQuery.String.trimEnd(this.value);
        return this;
    },
    
    splitTrim: function(separator)
    {
        return MiniQuery.String.splitTrim(this.value, separator);
    },
    
    startsWith: function(dest, ignoreCase)
    {
        return MiniQuery.String.startsWith(this.value, dest, ignoreCase);
    },
    
    endsWith: function(dest, ignoreCase)
    {
        return MiniQuery.String.endsWith(this.value, dest, ignoreCase);
    },
    
    contains: function(target)
    {
        return MiniQuery.String.contains(this.value, target);
    },
    
    padLeft: function(totalWidth, paddingChar)
    {
        this.value = MiniQuery.String.padLeft(this.value, totalWidth, paddingChar);
        return this;
    },
    
    padRight: function(totalWidth, paddingChar)
    {
        this.value = MiniQuery.String.padRight(this.value, totalWidth, paddingChar);
        return this;
    },
    
    toCamelCase: function() 
    {
        this.value = MiniQuery.String.toCamelCase(this.value);
        return this;
    },
    
    toHyphenate: function()
    {
        this.value = MiniQuery.String.toHyphenate(this.value);
        return this;
    },
    
    between: function(tag0, tag1)
    {
        this.value = MiniQuery.String.between(this.value, tag0, tag1);
        return this;
    },
    
    toUtf8: function()
    {
        this.value = MiniQuery.String.toUtf8(this.value);
        return this;
    }
};

MiniQuery.String.prototype.init.prototype = MiniQuery.String.prototype;


/***********************************************************************************************************
*   模板填充类工具
*/
MiniQuery.Template = 
{
    getSample: function()
    {
    }
    
    
};



/***********************************************************************************************************
*   CSS 类工具
*/

MiniQuery.CssClass = function(node)
{
    return new MiniQuery.CssClass.prototype.init(node);
};


MiniQuery.Object.extend( MiniQuery.CssClass,
{
    /**
    * 获取某个 DOM 元素的 class 类名；
    * 或者把一个用空格分隔的字符串转成 class 类名；
    * 返回一个数组。
    */
    get: function(node)
    {
        var names = '';
        if(node.className)
        {
            names = node.className;
        }
        else if(typeof node == 'string')
        {
            names = node;
        }
        
        return MiniQuery.String.splitTrim(names);
    },
    
    /**
    * 判断某个 DOM 节点是否包含指定的 class 类名。
    * 如果是，则返回 true；否则返回 false。
    */
    contains: function(node, name)
    {
        var list = this.get(node);
        return MiniQuery.Array.contains(list, name);    
    },
    
    /**
    * 给某个 DOM 节点添加指定的 class 类名（一个或多个）。
    */
    add: function(node, names)
    {
        var list = this.get(node);
        var classNames = names instanceof Array ? names : this.get(names);
        
        list = MiniQuery.Array.mergeUnique(list, classNames);   //合并数组，并去掉重复的项
        node.className = list.join(' ');
        
        return this;
    },
    
    /**
    * 给某个 DOM 节点移除指定的 class 类名（一个或多个）。
    */
    remove: function(node, names)
    {
        var list = this.get(node);
        var classNames = names instanceof Array ? names : this.get(names);
        
        MiniQuery.Array.each(classNames, function(item, index)  //逐项移除
        {
            list = MiniQuery.Array.remove(list, item);
        });
        
        node.className = list.join(' ');
        return this;
    },
    
    /**
    * 给某个 DOM 节点切换指定的 class 类名（一个或多个）。
    * 切换是指：如果之前已经有，则移除；否则添加进去。
    */
    toggle: function (node, names)
    {
        var list = this.get(node);
        var classNames = names instanceof Array ? names : this.get(names);
        MiniQuery.Array.each(classNames, function(item, index)  //逐项切换
        {
            list = MiniQuery.Array.toggle(list, item);
        });
        
        node.className = list.join(' ');
        return this;
    }
});



//----------------------------------------------------------------------------------------------------------------
//包装类的实例方法

MiniQuery.CssClass.prototype = 
{
    constructor: MiniQuery.CssClass,
    value: null,
    
    init: function(node)
    {
        this.value = node;
    },
    
    toString: function()
    {
        return this.get().join(' ');
    },
    
    valueOf: function()
    {
        return this.get(); //返回一个数组
    },
    
    get: function()
    {
        return MiniQuery.CssClass.get(this.value);
    },
    
    contains: function(name)
    {
        return MiniQuery.CssClass.contains(this.value, name);
    },
    
    add: function(names)
    {
        MiniQuery.CssClass.add(this.value, names);
        return this;
    },
    
    remove: function(names)
    {
        MiniQuery.CssClass.remove(this.value, names);
        return this;
    },
    
    toggle: function(names)
    {
        MiniQuery.CssClass.toggle(this.value, names);
        return this;
    }
};


MiniQuery.CssClass.prototype.init.prototype = MiniQuery.CssClass.prototype;

/***********************************************************************************************************
*   Style 样式类工具
*/
MiniQuery.Style = (function()
{
    
var iframe,
    iframeDoc;
    
    
return {

    getComputed: function(node, propertyName)
    {
        var name = MiniQuery.String.toCamelCase(propertyName);
	    var style = node.currentStyle || document.defaultView.getComputedStyle(node, null);
	    return style ? style[name] : null;
    },

    getDefault: function(nodeName, propertyName)
    {
        var cache = arguments.callee;
        if(!cache[nodeName])
        {
            cache[nodeName] = {};
        }
        
        if(!cache[nodeName][propertyName])
        {
            if(!iframe) //尚未存在 iframe，先创建它
            {
	            iframe = document.createElement( "iframe" );
	            iframe.frameBorder = iframe.width = iframe.height = 0;
	        }
	        
	        document.body.appendChild( iframe );
	        
	        /*
	            首次运行时，创建一个可缓存的版本。
	            IE 和 Opera 允许在没有重写假 HTML 到它的情况下重用 iframeDoc；
	            WebKit 和 Firefox 不允许重用 iframe document
	        */
            if (!iframeDoc || !iframe.createElement) 
            {
	            iframeDoc = (iframe.contentWindow || iframe.contentDocument).document;
	            iframeDoc.write((document.compatMode === 'CSS1Compat' ? 
	                '<!doctype html>' : '') + '<html><body>');
	            iframeDoc.close();
	        }

	        var node = iframeDoc.createElement(nodeName);
	        iframeDoc.body.appendChild(node);

            cache[nodeName][propertyName] = MiniQuery.Style.getComputed(node, propertyName);
            
	        document.body.removeChild(iframe);
        }
        
        return cache[nodeName][propertyName];
        
    },
    
    load:function(url, id)
    {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = url;
        
        if(id !== undefined)
        {
            link.id = id;
        }
        
        document.getElementsByTagName('head')[0].appendChild(link);
    },
    
    insert: function(css, id)
    {
        var style = document.createElement('style');
        style.type = 'text/css';
        
        if(id !== undefined)
        {
            style.id = id;
        }
        
        try //标准
        {
            style.appendChild( document.createTextNode(css) );
        }
        catch(ex) //IE
        {
            style.styleSheet.cssText = css;
        }
        
        document.getElementsByTagName('head')[0].appendChild(style);
    },
    
    write: function(href)
    {
        document.write('<link rel="stylesheet" rev="stylesheet" href="' + href + '" type="text/css" media="screen" />');
    },
    
    addRule: function(sheet, selectorText, cssText, index)
    {
        if(sheet.insertRule) //标准
        {
            sheet.inertRule(selectorText + '{' + cssText + '}', index);
        }
        else if(sheet.addRule) //IE
        {
            sheet.addRule(selectorText, cssText, index);
        }
        else
        {
            throw new Error('无法插入样式规则!');
        }
    },
    
    removeRule: function(sheet, index)
    {
        if(sheet.deleteRule)
        {
            sheet.deleteRule(index);
        }
        else if(sheet.romveRule)
        {
            sheet.removeRule(index);
        }
        else
        {
            throw new Error('无法删除样式规则!');
        }
    }
}
    
})();



/***********************************************************************************************************
*   DOM 类工具
*/
MiniQuery.DOM = 
{
    /**
    * 检测一个节点(refNode)是否包含另一个节点(otherNode)
    */
	contains:function(refNode, otherNode)
	{
	    //下面使用了惰性载入函数的技巧，即在第一次调用时检测了浏览器的能力并重写了接口
	    var fn = typeof refNode.contains == 'function' ? function(refNode, otherNode)
        {
            return refNode.contains(otherNode);
            
        } : typeof refNode.compareDocumentPosition == 'function' ? function(refNode, otherNode)
        {
            return !!(refNode.compareDocumentPosition(otherNode) & 16);
            
        } : function(refNode, otherNode)
        {
            var node = otherNode.parentNode;
            do
            {
                if(node === refNode)
                {
                    return true;
                }
    	        
                node = node.parentNode;
            }
            while(node !== null);
    	    
            return false;
        };
	    
	    MiniQuery.DOM.contains = fn;
	    
	    return fn(refNode, otherNode);
	},
	
	getInnerText: function(node)
	{
	    var fn = typeof node.textContent == 'string' ? function(node) //DOM3级: FF、Safari、Opera、Chrome
        {
            return node.textContent;
            
        } : function(node) //标准: IE、Safari、Opera、Chrome
        {
            return node.innerText;
        };
	    
	    MiniQuery.DOM.getInnerText = fn;
	    
	    return fn(node);
	},
	
	setInnerText: function(node, text)
	{
	    var fn = typeof node.textContent == 'string' ? function(node, text) //DOM3级: FF、Safari、Opera、Chrome
        {
            node.textContent = text;
            
        } : function(node, text) //标准: IE、Safari、Opera、Chrome
        {
            node.innerText = text;
        };
	    
	    MiniQuery.DOM.setInnerText = fn;
	    
	    fn(node, text);
	},
	
	
    isVisible: function(o)
    {
        var style = null;
        if(document.defaultView)
        {
            style = document.defaultView.getComputedStyle(o, null);
        }
        else if(o.currentStyle)
        {
            style = o.currentStyle;
        }
        else
        {
            throw new Error('未能判断!');
        }
        
        if (style.display == 'none' || style.visible == 'false') 
        {
            return false;
        }
        if(o.parentNode && o.parentNode.tagName.toLowerCase() != 'html')
        {
            return arguments.callee(o.parentNode);
        }
        return true;
    },
    
    show: function(o)
    {
        
        if(document.defaultView)
        {
            var computedStyle = document.defaultView.getComputedStyle(o, null);
            if(computedStyle.display == 'none')
            {
                o.style.display = 'inline';
            }
            if(computedStyle.visible == 'false')
            {
                o.style.visible = 'true';
            }
        }
        else if(o.currentStyle)
        {
            if(o.currentStyle.display == 'none')
            {
                o.style.display = 'inline';
            }
            if(o.currentStyle.visible == 'false')
            {
                o.style.visible = 'true';
            }
        }

        
        if(o.parentNode && o.parentNode.tagName.toLowerCase() != 'html')
        {
            arguments.callee(o.parentNode);
        }
        
    }
};


/***********************************************************************************************************
*   XML 类工具
*/
MiniQuery.XML = (function()
{


/**
* 针对 IE 创建最优版本的 XML Document 对象
*/
function createDocument()
{
    var cache = arguments.callee;
    
    if(!cache['version']) //首次创建
    {
        var versions = 
        [
            'MSXML2.DOMDocument.6.0',
            'MSXML2.DOMDocument.3.0',
            'MSXML2.DOMDocument'
        ];
        
        for(var i=0, len=versions.length; i<len; i++)
        {
            try
            {
                var xmldoc = new ActiveXObject(versions[i]);
                cache['version'] = versions[i]; //缓存起来
                return xmldoc;
            }
            catch(ex) //跳过
            {
            }
        }
    }
    
    return new ActiveXObject( cache['version'] );
}


/**
* 解析一个 XML 节点的属性集合成一个键/值形式的 Object 对象。
* 可以指定第二个参数是否为深层解析，即属性值中包含查询字符串编码时，可以进一步解析成对象。
*/
function parseAttributes(node, deep)
{
    var $ = MiniQuery;
    var obj = {};
    
    var attrs = $.Array.parse(node.attributes); //把类数组对象转成真正的数组
    
    $.Array.each(attrs, function(item, index)
    {
        if(item.specified) //兼容性写法，过滤出自定义特性，可用于 HTML 节点的 attributes
        {
            if(deep && item.value.indexOf('=') > 0) //深层次解码
            {
                obj[item.name] = $.Object.parseQueryString(item.value);
            }
            else
            {
                obj[item.name] = item.value;
            }
        }
        
    });
    
    return obj;
}

/**
* 跨浏览器解析 XML 数据(字符串)，返回一个 XML Document 对象。
*/
function parseString(data)
{
    var xmldoc = null;
    var impl = document.implementation;
    
    if(window.DOMParser) //标准
    {
        xmldoc = (new DOMParser()).parseFromString(data, 'text/xml');
        var errors = xmldoc.getElementsByTagName('parsererror');
        if(errors.length > 0)
        {
            throw new Error('XML 解析错误: ' + errors[0].textContent);
        }
    }
    else if(impl.hasFeature('LS', '3.0')) // DOM3
    {
        var parser = impl.createLSParser(impl.MODE_SYNCHRONOUS, null);
        var input = impl.createInput();
        input.stringData = data;
        xmldoc = parser.parse(input); //如果解析错误，则抛出异常
    }
    else // IE
    {
        xmldoc = createDocument();
        xmldoc.loadXML(data);
        if(xmldoc.parseError.errorCode != 0)
        {
            throw new Error('XML 解析错误: ' + xmldoc.parseError.reason);
        }
    }
    
    if(!xmldoc)
    {
        throw new Error('没有可用的 XML 解析器');
    }
    
    return xmldoc;
}

/**
* 把一个 Object 对象转成等价的 XML 字符串。
*
* 注意：传入的 Object 对象中，简单属性表示该节点自身的属性；
        数组表示该节点的子节点集合；
*       属性值只能是 string、number、boolean 三种值类型。
*/
function Object_to_String(obj, name)
{
    var $ = MiniQuery;
    var fn = arguments.callee;
    
    if(!name) //处理(重载) Object_to_String(obj) 的情况
    {
        for(name in obj)
        {
            return fn(obj[name], name);
        }
        
        throw new Error('参数 obj 中不包含任何成员');
    }
    
    
    //正常情况 Object_to_String(obj, name)
    
    var attributes = [];
    var children = [];
    
    for(var key in obj)
    {
        if(obj[key] instanceof Array) //处理子节点
        {
            $.Array.each(obj[key], function(child, index)
            {
                children.push( fn(child, key) );
            });
            continue;
        }
        
        //处理属性
        var type = typeof obj[key];
        if(type == 'string' || type == 'number' || type == 'boolean')
        {
            var value =  String(obj[key]).replace(/"/g, '\\"');
            attributes.push( $.String.format('{0}="{1}"', key, value) );
        }
        else
        {
            throw new Error('非法数据类型的属性值: ' + key);
        }
    }
    
    return $.String.format('<{name} {attributes}>{children}</{name}>',
    {
        name: name,
        attributes: attributes.join(' '),
        children: children.join(' \r\n')
    });
}
    
    
    


// MiniQuery.XML 真正指向这里

return {

    /**
    * 跨浏览器解析 XML 数据(字符串)或者一个等价结构的 Object 对象，返回一个 XML Document 对象。
    */
    parse: function(data)
    {
        var string = '';
        if(typeof data == 'string')
        {
            string = data;
        }
        else if(typeof data == 'object' && data)
        {
            string = Object_to_String(data);
        }
        
        if(!string)
        {
            throw new Error('非法的参数 data');
        }
        
        return parseString(string);
    },
    
    
    /**
    * 把一个 XML 对象或 XML 节点或一个 Object 对象解析成等价的 XML 字符串。
    *
    * 注意：传入的 Object 对象中，简单属性表示该节点自身的属性；
    *       数组表示该节点的子节点集合；
    *       属性值只能是 string、number、boolean 三种值类型。
    */
    toString: function(node)
    {
        var string = '';
        
        if(node && node.nodeName) //传入的是 node 节点
        {
            if(window.XMLSerializer) //标准
            {
                string = (new XMLSerializer()).serializeToString(node); 
            }
            else if(document.implementation.hasFeature('LS', '3.0')) // DOM3
            {
                string = document.implementation.createLSSerializer().writeToString(node);
            }
            else //IE
            {
                string = node.xml;
            }
        }
        else if(typeof node == 'object' && node)
        {
            string = Object_to_String(node);
        }
        
        return string;
    },
    
    
    
    /**
    * 把一个 XML 对象或 XML 字符串或 XML 节点解析成等价结构的 Object 对象
    * 
    * 注意：表示 XML 节点中的属性名不能跟直接子节点中的任何一个节点名相同。
    * 返回的 Object 对象中，属性表示该节点自身的属性；数组表示该节点的子节点集合。
    */
    toObject: function(node, deep)
    {
        var $ = MiniQuery;
        var fn = arguments.callee;
        
        if(typeof node == 'string') //传入的是 XML 的字符串
        {
            var data = node;
            var xml = parseString(data);
            return fn(xml, deep);
        }
        
        if(node && node.documentElement) //传入的是 XML 对象
        {
            var xml = node;
            var obj = {};
            obj[xml.documentElement.nodeName] = fn(xml.documentElement, deep);
            return obj;
        }
        
        if(!node.nodeName)
        {
            throw new Error('非法的 XML 节点');
        }
        

        var obj = parseAttributes(node, deep);
        
        //过虑出真正的元素节点。IE 中 node 节点 没有 children 属性，因此用 childNodes 是兼容的写法
        var children = $.Array.map( $.Array.parse(node.childNodes),  function(item, index)
        {
            return item.nodeType === 1 ? item : null;
        });
        
        $.Array.each(children, function(child, index)
        {
            var name = child.nodeName;
            if(!obj[name])
            {
                obj[name] = [];
            }
            
            obj[name].push( fn(child) );
        });
        
        return obj;
        
    }
    
};




})();

/* 示例







console.clear();

var s = 
'<Person num="2" code="0"> \
	<user id="1" name="micty" age="28"> \
		<book id="1" name="C++" price="100"></book> \
		<book id="2" name="C#.NET" price="256"></book> \
		<book id="3" name="JavaScript" price="218"></book> \
	</user> \
	<user id="2" name="solomon" age="25"> \
		<book id="1" name="CPP" price="100"></book> \
		<book id="2" name="Linux" price="156"></book> \
	</user> \
</Person>';

//1
var o = MiniQuery.XML.toObject(s);
console.dir(o); //测试  string -> object

//2
var xmldoc = MiniQuery.XML.parse(s);
console.dir(xmldoc); // 测试 string -> xmldoc

//3
var xmldoc = MiniQuery.XML.parse(o);
console.dir(xmldoc); // 测试 object -> xmldoc


//4
console.log( MiniQuery.XML.toString(o) ); // 测试 object -> string

//5
console.log( MiniQuery.XML.toString(xmldoc) ); // 测试 xmldoc -> string

//6
console.dir( MiniQuery.XML.toObject(xmldoc) ); // 测试 xmldoc -> object


*/


/***********************************************************************************************************
*   XML 类工具
*/
MiniQuery.XHR = 
{
    /**
    * 跨浏览器创建一个 XMLHttpRequest 对象。
    * 由于内存原因，不建议重用创建出来的 xhr 对象。
    */
    create: function()
    {
        //下面使用了惰性载入函数的技巧，即在第一次调用时检测了浏览器的能力并重写了接口
        var fn = window.XMLHttpRequest ? function() //标准方法
        {
            return new XMLHttpRequest();
            
        }: window.ActiveXObject ? function() //IE
        {
            var cache = arguments.callee;
            var key = 'version';
            
            if(!cache[key]) //首次创建
            {
                var versions = 
                [
                    'MSXML2.XMLHttp.6.0',
                    'MSXML2.XMLHttp.3.0',
                    'MSXML2.XMLHttp'
                ];
                
                for(var i=0, len=versions.length; i<len; i++)
                {
                    try
                    {
                        var xhr = new ActiveXObject(versions[i]);
                        cache[key] = versions[i];
                        return xhr;
                    }
                    catch(ex) //跳过
                    {
                    }
                }
            }
            
            return new ActiveXObject(cache[key]);
            
        }: function()
        {
            throw new Error('没有可用的 XHR 对象');
        };
        
        
        MiniQuery.XHR.create = fn;
        
        return fn();
    },
    
    Headers: 
    {
        toObject: function(xhr)
        {
            var obj = {};
            
            var headers = xhr.getAllResponseHeaders().split('\n');
            for(var i=0, len=headers.length; i<len; i++)
            {
                var pair = headers[i].split(': '); //注意，这里多一个空格
                if(pair.length < 2)
                {
                    continue;
                }
                
                obj[ pair[0] ] = pair[1];
            }
            
            return obj;
        },
        
        set: function(xhr, key, value)
        {
            if(typeof key == 'string' && value !== undefined) 
            {
                xhr.setRequestHeader(key, String(value));
            }
            else if(typeof key == 'object' && value === undefined)
            {
                var properties = key;
                for(var key in properties)
                {
                    var value = properties[key];
                    
                    if(typeof value == 'function')
                    {
                        value = value();
                    }
                    
                    xhr.setRequestHeader(key, String(value));
                }
            }
        }
    }
};

/***********************************************************************************************************
*   事件类工具
*/
MiniQuery.Event = (function()
{
    /**
    * 一个管理事件列表的辅助类
    */
    var List = (function()
    {
        var key = '__EventList__' + String(Math.random()).replace('.', '');
        
        function add(node, type, fn)
        {
            var list = MiniQuery.Data.get(node, key) || {};
            if(!list[type])
            {
                list[type] = [];
            }
            
            list[type].push(fn);
            
            MiniQuery.Data.set(node, key, list); //这里一定要写回去
        }
        
        function remove(node, type, fn)
        {
            var list = MiniQuery.Data.get(node, key);
            if(list && list[type])
            {
                MiniQuery.Array.remove(list[type], fn);
            }
        }
        
        function clear(node, type)
        {
            var list = MiniQuery.Data.get(node, key);
            if(list && list[type])
            {
                list[type] = []
            }
        }
        
        function get(node, type)
        {
            var list = MiniQuery.Data.get(node, key);
            if(type === undefined)
            {
                return list;
            }
            
            return list ? list[type] : [];
        }
        

        
        return {
            add: add,
            remove: remove,
            clear: clear,
            get: get
        };
    })();

    
    /**
    * MiniQuery.Event 指向这里
    */
    return {
        /**
        * 给 DOM 节点绑定一个事件处理函数，同时可以向该事件处理函数传递参数(如果需要)。
        * 该事件处理函数会接收到一个事件对象和传递进来的参数(如果有)。
        * 接收到的事件对象中包含标准的 preventDefault 和 stopPropagation 方法。
        * 如果既想取消默认的行为，又想阻止事件起泡，这个事件处理函数可以返回 false。
        */
        bind: function(node, type, fn, args, isOne)
        {
            //处理 MiniQuery.Event.bind(node, {click: function(){}, focus: function(){}});
            if(type && typeof type == 'object' && fn === undefined && args === undefined)
            {
                var maps = type;
                var bind = arguments.callee;
                MiniQuery.Object.each(maps, function(name, value)
                {
                    bind(node, name, value, args, isOne);
                });
                return;
            }
            
            
            var exFn = function (event)  //钩子函数，扩展原有的 fn 方法
            {
                event = MiniQuery.Event.getEvent(event);
                if(!event.stopPropagation)
                {
                    event.stopPropagation = function()
                    {
                        event.cancelBubble = true;
                    };
                }
                if(!event.preventDefault)
                {
                    event.preventDefault = function()
                    {
                        event.returnValue = false;
                    };
                }
                
                args = [event].concat(args || []);
                var value = fn.apply(node, args); //在 fn 中使用 this 指向当前 DOM 节点
                if(value === false)
                {
                    MiniQuery.Event.stop(event);
                }
                
                isOne && MiniQuery.Event.unbind(node, type, fn);
                
            };
            
            List.add(node, type, fn);
            fn[MiniQuery.expando] = exFn; //保存 exFn 的引用，以便在 unbind 中能引用到
            
            if(node.addEventListener)
            {
                node.addEventListener(type, exFn, false);
            }
            else if(node.attachEvent)
            {
                node.attachEvent('on' + type, exFn);
            }
            else
            {
                node['on' + type] = exFn;
            }
            
            
            
           
        },
        
        /**
        * 解除绑定 DOM 节点指定的事件处理函数
        */
        unbind: function(node, type, fn)
        {
            List.remove(node, type, fn);
            
            if(node.removeEventListener)
            {
                node.removeEventListener(type, fn[MiniQuery.expando], false);
            }
            else if(node.detachEvent)
            {
                node.detachEvent('on' + type, fn[MiniQuery.expando]);
            }
            else
            {
                node['on' + type] = null;
            }
        },
        
        /**
        * 清空 DOM 节点指定类型的全部事件处理函数
        */
        clear: function(node, type)
        {
            var list = List.get(node, type);
            
            MiniQuery.Array.each(list, function(fn, index)
            {
                MiniQuery.Event.unbind(node, type, fn);
            });
        },
        
        /**
        * 清空 DOM 节点全部类型的全部事件处理函数
        */
        clearAll: function(node)
        {
            var all = List.get(node);
            for(var type in all)
            {
                MiniQuery.Event.clear(node, type);
            }
        },
        
        
        /**
        * 这个特别的方法将会触发 DOM 节点指定的事件类型上所有绑定的处理函数。
        * 但不会执行浏览器默认动作，也不会产生事件冒泡。
        * 返回的是最后一个事件处理函数的返回值
        */
        triggerHandler: function(node, type, args)
        {
            var value;
            
            var list = List.get(node, type);
            MiniQuery.Array.each(list, function(fn, index)
            {
                value = fn.apply(node, args);
            });
            
            return value;
        },
        
        getEvent: function(event)
        {
            return event || window.event;
        },
        
        getTarget: function(event)
        {
            return event.target || event.srcElement;
        },
        
        preventDefault: function(event)
        {
            if(event.preventDefault)
            {
                event.preventDefault();
            }
            else
            {
                event.returnValue = false;
            }
        },
        
        stopPropagation: function(event)
        {
            if(event.stopPropagation)
            {
                event.stopPropagation();
            }
            else
            {
                event.cancelBubble = true;
            }
        },
        
        stop: function(event)
        {
            MiniQuery.Event.stopPropagation(event);
            MiniQuery.Event.preventDefault(event);
        },
        
        getRelatedTarget: function(event)
        {
            return event.relatedTarget || event.toElement || event.fromElement || null;
        },
        
        getButton: function(event)
        {
            if(document.implementation.hasFeature('MouseEvents', '2.0'))
            {
                return event.button;
            }
            
            //         0  1  2  3  4  5  6  7
            var map = [0, 0, 2, 0, 1, 0, 2, 0];
            return map[event.button];
        },
        
        getWheelDelta: function(event)
        {
            return event.wheelDelta || (-event.detail * 40);
        },
        
        
        
        /**
        * 当 DOM 载入就绪可以查询及操纵时，绑定一个要执行的函数。
        */
        ready: (function()
        {
            var isReady = false;
            var readyList = [];
            
            // 文档已加载完
            if (document.readyState === "complete") 
            {  
                //异步执行，让脚本有机会做其他事
                return setTimeout(DOMContentLoaded, 1);  
            }  
            
            if(document.addEventListener) //标准浏览器
            {
                document.addEventListener("DOMContentLoaded", DOMContentLoaded, false);
                
                // 如果注册 DOMContentLoaded 事件句柄失败，注册到 window 的 onload 上作为后手  
                window.addEventListener("load", DOMContentLoaded, false);  
            }
            else if(document.attachEvent) //IE浏览器
            {
                // 如果是 iframe, 绑定到 onreadystatechange, 会在 window.onload 前触发 
                document.attachEvent("onreadystatechange", DOMContentLoaded);
                
                // 同样注册到 onload 上作为后手
                window.attachEvent("onload", DOMContentLoaded);
          
                // 如果不是一个 iframe，检查 DOM 是否加载完毕
                var isTopLevel = false;
		        try 
		        {
			        isTopLevel = (window.frameElement == null);
		        } 
		        catch(e) 
		        {
		        }

		        if (isTopLevel && document.documentElement.doScroll) 
		        {
			        doScrollCheck();
		        }
            }
            
            function DOMContentLoaded()
            {
                if(isReady) //已执行过
                {
                    return;
                }
                
                isReady = true;
                
                for(var i=0, len=readyList.length; i<len; i++)
                {
                    readyList[i].apply(document); //回调方法中的 this 指向 document
                }
                readyList = null; //清空列表
                
                //执行完毕回调列表，解除绑定 DOM 的就绪事件
                if(document.removeEventListener) //标准浏览器
                {
                    document.removeEventListener("DOMContentLoaded", DOMContentLoaded, false);
                }
                else if(document.detachEvent) //IE浏览器
                {
                    document.detachEvent("onreadystatechange", DOMContentLoaded);
                }
            }
            
            function doScrollCheck()
            {
                try
                {
                    document.documentElement.doScroll("left");
                }
                catch(e)
                {
                    setTimeout(doScrollCheck, 1);
                    return;
                }
                
                DOMContentLoaded();
            }
            
            
            return function(fn)
            {
                if(isReady)
                {
                    fn.call(document);  // fn 中，this 指向 document 
                }
                else
                {
                    readyList.push(fn);
                }
            }
        })()
    
    };
    
})();



/***********************************************************************************************************
*   插件类工具
*/
MiniQuery.Plugin = 
{
    contains: function(name)
    {
        var has = false;
        
        name = name.toLowerCase();
        var plugins = navigator.plugins;
        
        for(var i=0, len=plugins.length; i<len; i++)
        {
            if(plugins[i].name.toLowerCase().indexOf(name) >= 0)
            {
                has = true;
                break;
            }
        }
        
        if(!has)
        {
            try
            {
                new ActiveXObject(name);
                has = true;
            }
            catch(ex)
            {
                has = false;
            }
        }
        
        return has;
    },
    
    hasFlash: function()
    {
        var yes = MiniQuery.Plugin.contains('Flash');
        if(!yes)
        {
            yes = MiniQuery.Plugin.contains('ShockwaveFlash.ShockwaveFlash');
        }
        
        return yes;
    },
    
    hasQuickTime: function()
    {
        var yes = MiniQuery.Plugin.contains('QuickTime');
        if(!yes)
        {
            yes = MiniQuery.Plugin.contains('QuickTime.QuickTime');
        }
        
        return yes;
    }

};




/***********************************************************************************************************
*   数据缓存类工具
*/
MiniQuery.Data = (function()
{
    var cache = {};
    var uuid = 0;
    
    var noData = 
    {
	    "embed": true,
	    
	    // Ban all objects except for Flash (which handle expandos)
	    "object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
	    "applet": true
    };
    
    //判断某个节点能否缓存数据
    function acceptData(node)
    {
        if(!node || !node.nodeName)
        {
            return false;
        }
        
        var match = noData[node.nodeName.toLowerCase()];
        if(match)
        {
            return !(match === true || node.getAttribute("classid") !== match);
        }
        
        return true;
    }
    
    /**
    * 给某个节点设置指定键值的数据。
    * 当键不是 string、number、boolean 类型时，则用该键覆盖该节点的全部数据。
    */
    function set(node, key, value)
    {
        if(!acceptData(node))
        {
            throw new Error('无法在该节点上缓存数据!');
        }
        
        var expando = MiniQuery.expando;
        
        var id = node[expando];
        if(!id) //不存在id，说明是第一次给该节点设置数据
        {
            id = ++uuid;
            node[expando] = id; //分配唯一的 id
        }
        
        if(!cache[id]) //不存在该节点关联的数据
        {
            cache[id] = {};
        }
        
        if(MiniQuery.Object.isValueType(key))
        {
            cache[id][String(key)] = value;
        }
        else // object、function、...
        {
            cache[id] = key;
        }
    }
    
    /**
    * 获取某个节点指定键的数据。
    * 当不指定键时，则获取该节点关联的全部数据，返回一个 Object 对象。
    */
    function get(node, key)
    {
        var id = node[MiniQuery.expando];
        
        return key === undefined ? cache[id] || null :
            cache[id] ? cache[id][key] : null;
    }
    
    /**
    * 移除某个节点指定键的数据。
    * 当不指定键时，则移除该节点关联的全部数据
    */
    function remove(node, key)
    {
        var id = node[MiniQuery.expando];
        if(cache[id])
        {
            if(key === undefined)
            {
                cache[id] = null;
            }
            else
            {
                delete cache[id][key];
            }
        }
        
    }
    
    return {
        set: set,
        get: get,
        remove: remove,
        acceptData: acceptData
    };
    
    
})();



/***********************************************************************************************************
*  队列工具
*/

MiniQuery.Queue = (function()
{


function Queue(list)
{
    return new Queue.prototype.init(list);
}

Queue.prototype = 
{
    constructor: Queue,
    
    init: function(list) //应该看成是一个构造器
    {
        var list = list ? list.slice(0) : this.list;
        var queue = [];
        
        for(var i=0, len=list.length; i<len; i++)
        {
            queue[i] = (function(i) //这里必须加一个闭包
            {
                return function()
                {
                    list[i](queue[i+1]);
                };
            })(i);
        }
        
        queue.push(this.noop);
        
        this.list = list;
        this.queue = queue;
    },
    
    noop: function(){},

    size: function()
    {
        return this.list.length;
    },
    
    run: function()
    {
        this.queue[0]();
        return this;
    },
    
    push: function(fn)
    {
        var queue = this.queue;
        
        var lastIndex = queue.length - 1;
        
        queue[lastIndex] = (function(i)
        {
            return function()
            {
                fn(queue[i+1]);
            };
        })(lastIndex);
        
        queue.push(this.noop);
        this.queue = queue;
        this.list.push(fn);
        
        return this;
    },
    
    shift: function()
    {
        this.list.shift()(this.noop);
        this.init();
        
        return this;
    },
    
    pop: function()
    {
        this.list.pop()(this.noop);
        this.queue.length -= 2;
        this.queue.push(this.noop);
        return this;
    }
    
};

//修正引用
Queue.prototype.init.prototype = Queue.prototype;

return Queue;
    
    
    
    
})();


/***********************************************************************************************************
*   MiniQuery 对象原型方法: 显示/隐藏
*/
MiniQuery.prototype.extend(
{
    show: function()
    {
        this.each(function(index)
        {
            this.style.display = '';
            
        });
        return this;
    },
    
    hide: function()
    {
        this.each(function(index)
        {
            this.style.display = 'none';
        });
        return this;
    },
    
    toggle: function(isVisible)
    {
        if(isVisible === true)
        {
            this.show();
        }
        else if(isVisible === false)
        {
            this.hide();
        }
        else
        {
            this.each(function(index)
            {
                if(this.style.display == 'none')
                {
                    this.style.display = '';
                }
                else
                {
                    this.style.display = 'none';
                }
            });
        }
        return this;
    },
    
    isVisible: function()
    {
        if(this.length == 0)
        {
            return false;
        }
        
        return MiniQuery.DOM.isVisible(this[0]);
    }
});


/***********************************************************************************************************
*   MiniQuery 对象原型方法: 属性
*/
MiniQuery.prototype.extend(
{
    attr: function(arg0, arg1)
    {
        if(typeof arg0 == 'string')
        {
            switch(typeof arg1)
            {
                //$(node).attr(name) 取值
                case 'undefined':
                    var name = arg0;
                    return this.length > 0 ? this[0].getAttribute(name) : '';
                
                //$(node).attr(key, fn) 设置值   
                case 'function':
                    var key = arg0;
                    var fn = arg1;
                    this.each(function(index)
                    {
                        this.setAttribute(key, fn.call(this));  //该 this 指向 DOM 元素
                    });
                    break;
                    
                //$(node).attr(key, value)   
                default:
                    var key = arg0;
                    var value = String(arg1);
                    this.each(function(index)
                    {
                        this.setAttribute(key, value);
                    });
                    break;
            }
        }
        else if(typeof arg0 == 'object' && arg0)
        {
            var properties = arg0;
            
            this.each(function(index)
            {
                var node = this;
                
                MiniQuery.Object.each(properties, function(name, value)
                {
                    if(typeof value == 'function')
                    {
                        value = value.call(node, index, node.getAttribute(name));
                    }
                    node.setAttribute(name, String(value));
                });
            });
        }
        
        return this;
    },
    
    //从每一个匹配的元素中删除一个属性
    removeAttr: function(name)
    {
        this.each(function(index)
        {
            this.removeAttribute(name);
        });

        return this;            
    }
    
});

/***********************************************************************************************************
*   MiniQuery 对象原型方法: 属性和值
*/
MiniQuery.prototype.extend(
{
    html: function(val)
    {
        if(val === undefined) //此时相当于 $(node).html()
        {
            return this.length > 0 ? this[0].innerHTML : '';
        }
        
        if(typeof val == 'function')
        {
            var fn = val;
            this.each(function(index)
            {
                this.innerHTML = fn.call(this, index, this.innerHTML);
            });
        }
        else
        {
            this.each(function(index)
            {
                this.innerHTML = String(val);
            });
        }
        
        return this;
    },
    
    val: function(val)
    {
        if(val === undefined)   //取值
        {
            return this.length > 0 ? this[0].value : '';
        }
        
        if(typeof val == 'string')
        {
            this.each(function(index)
            {
                this.value = val;
            });
        }
        
        if(typeof val == 'function')
        {
            var fn = val;
            
            this.each(function(index)
            {
                this.value = fn.call(this, index, this.value);
            });
        }
        else if(val instanceof Array)
        {
            var array = val;
            var len = Math.min(this.length, array.length);
            for(var i=0; i<len; i++)
            {
                this[i].value = array[i];
            }
            
            this.each(function(index)
            {
                var node = this;
                for(var i=0, len=array.length; i<len; i++)
                {
                    
                }
            });
        }
        
        return this;
    }
});


/***********************************************************************************************************
*   MiniQuery 对象原型方法: 文档处理
*/
MiniQuery.prototype.extend(
{
    //向每个匹配的元素内部追加内容。
    append: function(content)
    {
        if(typeof content == 'string')
        {
            this.each(function(index)
            {
                this.innerHTML = this.innerHTML + content;
            });
        }
        else if(typeof content == 'function')
        {
            var fn = content;
            this.each(function(index)
            {
                this.innerHTML = this.innerHTML + fn.call(this, index, this.innerHTML);
            });
        }
        
        return this;
    },
    
    //向每个匹配的元素内部前置内容。
    prepend: function(content)
    {
        if(typeof content == 'string')
        {
            this.each(function(index)
            {
                this.innerHTML = content + this.innerHTML;
            });
        }
        else if(typeof content == 'function')
        {
            var fn = content;
            this.each(function(index)
            {
                this.innerHTML = fn.call(this, index, this.innerHTML) + this.innerHTML;
            });
        }
        
        return this;
    },
    
    //在每个匹配的元素之后插入内容。
    after: function(content)
    {
        if(typeof content == 'string')
        {
            this.each(function(index)
            {
                this.outerHTML = this.outerHTML + content;
            });
        }
        else if(typeof content == 'function')
        {
            var fn = content;
            this.each(function(index)
            {
                this.outerHTML = this.outerHTML + fn.call(this, index, this.outerHTML);
            });
        }
        
        return this;
    },
    
    //在每个匹配的元素之前插入内容。
    before: function(content)
    {
        if(typeof content == 'string')
        {
            this.each(function(index)
            {
                this.outerHTML = content + this.outerHTML;
            });
        }
        else if(typeof content == 'function')
        {
            var fn = content;
            this.each(function(index)
            {
                this.outerHTML = fn.call(this, index, this.outerHTML) + this.outerHTML;
            });
        }
        
        return this;
    },
    
    wrap: function(arg)
    {
        if(typeof arg == 'string')
        {
            var html = arg;
            var pos = html.indexOf('</'); //
            if(pos < 1)
            {
                throw new Error('输入的 HTML 格式非法：' + html);
            }
            
            var left = html.substring(0, pos);
            var right = html.substring(pos);
            
            this.each(function(index)
            {
                this.outerHTML = left + this.outerHTML + right;
            });
        }
        
        
        return this;
    },


    
    empty: function()
    {
        this.each(function(index)
        {
            this.innerHTML = '';
        });
    }
});

/***********************************************************************************************************
*   MiniQuery 对象原型方法: 数据缓存
*/
MiniQuery.prototype.extend(
{
    data: function(name, value)
    {
        if(value === undefined) //此时相当于 $(node).data(name);  取值
        {
            var type = typeof name;
            if(type == 'string')
            {
                return this.length > 0 ? MiniQuery.Data.get(this[0], name) : null;
            }
            
            if(type == 'object')
            {
                this.each(function(index)
                {
                    var node = this;
                    var obj = name;
                    MiniQuery.Object.each(obj, function(key, value)
                    {
                        MiniQuery.Data.set(node, key, value);
                    });
                });
                
                return this;
            }
        }
        else
        {
            this.each(function(index)
            {
                var node = this;
                MiniQuery.Data.set(node, name, value);
            });
            
            return this;
        }
    },
    
    removeData: function(name)
    {
        this.each(function(index)
        {
            MiniQuery.Data.remove(this, name);
        });
    }
});



/***********************************************************************************************************
*   MiniQuery 对象原型方法: 事件
*/
MiniQuery.prototype.extend(
{
    /**
    * 当 DOM 载入就绪可以查询及操纵时，绑定一个要执行的函数。
    */
    ready: function(fn)
    {
        MiniQuery.Event.ready(fn);
        return this;
    },
    
    /**
    * 为每一个匹配元素的特定事件（像click）绑定一个事件处理器函数。
    */
    bind: function(type, fn, args)
    {
        if(type == 'string')
        {
            var reg = /\s|,|\|/g;
            
            if(reg.test(type)) //多个事件名
            {
                //处理多个类型的事件名，可以以空格、逗号、竖线进行分隔
                //如：$(node).bind('click mouseover|blur,mouseout', fn);
                var types = MiniQuery.String.splitTrim(type, reg); 
                this.each(function(index)
                {
                    for(var i=0, len=types.length; i<len; i++)
                    {
                        MiniQuery.Event.bind(this, types[i], fn, args);
                    }
                });
            }
            
            return this;
        }
        
        //单个事件名，或 JSON 格式的事件集
        this.each(function(index)
        {
            MiniQuery.Event.bind(this, type, fn, args);
        });
                
        return this;
    },
    
    /**
    * bind()的反向操作，从每一个匹配的元素中删除绑定的事件。
    * 如果没有参数，则删除所有绑定的事件。
    * 如果提供了事件类型作为参数，则只删除该类型的绑定事件。
    * 如果把在绑定时传递的处理函数作为第二个参数，则只有这个特定的事件处理函数会被删除。
    */
    unbind: function(type, fn)
    {
        // $(node).unbind(); 删除所有绑定的事件 
        if(type === undefined && fn === undefined) 
        {
            this.each(function(index)
            {
                MiniQuery.Event.clearAll(this);
            });
        }
        
        // $(node).unbind(type); 只删除该类型的绑定事件
        else if(fn === undefined) 
        {
            this.each(function(index)
            {
                MiniQuery.Event.clear(this, type);
            });
        }
        
        // $(node).unbind(type, fn); 只删除特定的事件处理函数
        else 
        {
            this.each(function(index)
            {
                MiniQuery.Event.unbind(this, type, fn);
            });
        }
        
        return this;
    },
    
    /**
    * 这个特别的方法将会 MiniQuery 对象集合中第一个节点指定的事件类型上所有绑定的处理函数。
    * 但不会执行浏览器默认动作，也不会产生事件冒泡。
    * 返回的是最后一个事件处理函数的返回值，而不是据有可链性的 MiniQuery 对象。
    */
    triggerHandler: function(type, data)
    {
        if(this[0])
        {
            return MiniQuery.Event.triggerHandler(this[0], type, data);
        }
    },

    
    /**
    * 为每一个匹配元素的特定事件（像click）绑定一个一次性的事件处理函数。
    * 该方法还有问题，只适用第一个绑定到的 DOM 元素。
    */
    one: function(type, fn, args)
    {
        this.each(function(index)
        {
            MiniQuery.Event.bind(this, type, fn, args, true);
        });
        return this;
    }
});


MiniQuery.Array.each(
[
    'blur', 
    'change', 'click', 
    'dblclick', 
    'error', 
    'focus', 'focusin', 'focusout', 
    'keydown', 'keypress', 'keyup', 'load', 
    'mousedown', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 
    'resize', 
    'scroll', 'select', 'submit', 
    'unload' 
], function(item, index)
{
    MiniQuery.prototype[item] = function(fn, args)
    {
        this.bind(item, fn, args);
        return this;
    };
});





/***********************************************************************************************************
*   MiniQuery 对象原型方法: CSS
*/
MiniQuery.prototype.extend(
{
    css: function(arg0, arg1)
    {
        if(typeof arg0 == 'string')
        {
            var name = MiniQuery.String.toCamelCase(arg0); //转成骆驼法命名
            switch(typeof arg1)
            {
                // $(node).css(name)
                case 'undefined':
                    return this.length > 0 ? this[0].style[name] : '';
                    
                // $(node).css(name, fn)
                case 'function':
                    var fn = arg1;
                    this.each(function(index)
                    {
                        this.style[name] = fn.call(this, index, this.style[name]);
                    });
                    break;
                
                // $(node).css(name, value)
                default:
                    var value = String(arg1);
                    this.each(function(index)
                    {
                        this.style[name] = value;
                    });
                    break;
            }
        }
        
        // $(node).css(properties)
        else if(typeof arg0 == 'object' && arg0)
        {
            var properties = arg0;
            
            this.each(function(index)
            {
                var node = this;
                
                MiniQuery.Object.each(properties, function(name, value)
                {
                    name = MiniQuery.String.toCamelCase(name); //转成骆驼法命名
                    if(typeof value == 'function')
                    {
                        value = value.call(node, index, node.style[name]);
                    }
                    node.style[name] = String(value);
                });
            });
        }
        
        return this;
    }
});



/***********************************************************************************************************
*   MiniQuery 对象原型方法: CssClass
*/
MiniQuery.prototype.extend(
{
    addClass: function(classNames)
    {
        if(typeof classNames == 'string')
        {
            this.each(function(index)
            {
                MiniQuery.CssClass.add(this, classNames);
            });
        }
        else if(typeof classNames == 'function')
        {
            var fn = classNames;
            
            this.each(function(index)
            {
                MiniQuery.CssClass.add(this, fn(index, this.className));
            });
        }
        
        return this;
    },
    
    removeClass: function(classNames)
    {
        if(typeof classNames == 'string')
        {
            this.each(function(index)
            {
                MiniQuery.CssClass.remove(this, classNames);
            });
        }
        else if(typeof classNames == 'function')
        {
            var fn = classNames;
            
            this.each(function(index)
            {
                MiniQuery.CssClass.remove(this, fn(index, this.className));
            });
        }
        
        return this;
    },
    
    toggleClass: function(classNames, isAdded)
    {
        if(isAdded === true)
        {
            this.addClass(classNames);
        }
        else if(isAdded === false)
        {
            this.removeClass(classNames);
        }
        else
        {
            
            if(typeof classNames == 'string')
            {
                this.each(function(index)
                {
                    MiniQuery.CssClass.toggle(this, classNames);
                });
            }
            else if(typeof classNames == 'function')
            {
                var fn = classNames;
                
                this.each(function(index)
                {
                    MiniQuery.CssClass.toggle(this, fn(index, this.className));
                });
            }
        }
    },
    
    hasClass: function(className)
    {
        var has = false;
        
        this.each(function(index)
        {
            if(MiniQuery.CssClass.contains(this, className))
            {
                has = true;
                return false;   //break
            }
        });
        
        return has;
    }
});




//先备份原来的 MiniQuery 和 $，以防止重写其他库使用的 MiniQuery 和 $
var _MiniQuery = window.MiniQuery;
var _$ = window.$;

//把 MiniQuery 和 $ 暴露到 window
window.MiniQuery = window.$ = MiniQuery;



})(window);
