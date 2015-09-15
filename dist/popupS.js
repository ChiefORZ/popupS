;(function (root, factory) {

    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof exports === 'object') {
        factory();
    } else {
        root.PopupS = factory();
    }

}(this, function () {
    'use strict';

    var _defaults  = {
        appendLocation: (document.body || document.documentElement),
        addClassName: {
            base: '',
            buttonHolder: '',
            buttonOk: '',
            buttonCancel: '',
            closeBtn: '',
            form: '',
            overlay: '',
            popup: ''
        },
        baseClassName: 'popupS',
        flags: {
            bodyScroll: false,
            buttonReverse: false,
            closeByEsc: true,
            closeByOverlay: true,
            showCloseBtn: true
        },
        labels: {
            ok: 'OK',
            cancel: 'Cancel'
        },
        loader: 'spinner',
        zIndex: 10000
    }

    var transition = (function() {
        var t, type;
        var supported = false;
        var el = document.createElement("fakeelement");
        var transitions = {
            "WebkitTransition": "webkitTransitionEnd",
            "MozTransition": "transitionend",
            "OTransition": "otransitionend",
            "transition": "transitionend"
        };

        for(t in transitions) {
            if (transitions.hasOwnProperty(t) && el.style[t] !== undefined) {
                type = transitions[t];
                supported = true;
                break;
            }
        }

        return {
            type: type,
            supported: supported
        };
    })()

    /**
     * Object iterator
     *
     * @param  {Object|Array}  obj
     * @param  {Function}      iterator
     */
    function _each(obj, iterator) {
        if (obj) {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    iterator(obj[key], key, obj);
                }
            }
        }
    }
    /**
     * Copy all of the properties in the source objects over to the destination object
     *
     * @param   {...Object}     out
     *
     * @return  {Object}
     */
    function _extend(out) {
        out = out || {};

        for (var i = 1; i < arguments.length; i++) {
            if (!arguments[i])
                continue;

            for (var key in arguments[i]) {
                if (arguments[i].hasOwnProperty(key))
                    out[key] = arguments[i][key];
            }
        }

        return out;
    }
    /**
     * Copy all of the properties in the source objects over to the destination object
     *
     * @param   {...Object}     out
     *
     * @return  {Object}
     */
    function _deepExtend(out) {
        out = out || {};

        for (var i = 1; i < arguments.length; i++) {
            var obj = arguments[i];

            if (!obj)
                continue;

            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (typeof obj[key] === 'object')
                        _deepExtend(out[key], obj[key]);
                    else
                        out[key] = obj[key];
                }
            }
        }

        return out;
    }
    /**
     * Bind events to elements
     *
     * @param  {HTMLElement}    el
     * @param  {Event}          event
     * @param  {Function}       fn
     */
    function _bind(el, event, fn) {
        if (typeof el.addEventListener === "function") {
            el.addEventListener(event, fn, false);
        } else if (el.attachEvent) {
            el.attachEvent("on" + event, fn);
        }
    }
    /**
     * Unbind events from element
     *
     * @param  {HTMLElement}    el
     * @param  {Event}          event
     * @param  {Function}       fn
     */
    function _unbind(el, event, fn) {
        if (typeof el.removeEventListener === "function") {
            el.removeEventListener(event, fn, false);
        } else if (el.detachEvent) {
            el.detachEvent("on" + event, fn);
        }
    }
    /**
     * css recursion
     *
     * @param   {HTMLElement}   el
     * @param   {Object|String} prop
     * @param   {String}        [val]
     */
    function _css(el, prop, val) {
        if (el && el.style && prop) {
            if (prop instanceof Object) {
                for (var name in prop) {
                    _css(el, name, prop[name]);
                }
            } else {
                el.style[prop] = val;
            }
        }
    }
    /**
     * Selector RegExp
     *
     * @const   {RegExp}
     */
    // orig: /^(\w+)?(#\w+)?((?:\.[\w_-]+)*)/i;
    var R_SELECTOR = /^(\w+)?(#[\w_-]+)?((?:\.[\w_-]+)*)/i;

    /**
     * build DOM Nodes
     *
     * @example
     *  _buildDOM({
     *      tag:'div#id.class.class2',
     *      css:{
     *          opacity:'1',
     *          width:'100px'
     *      },
     *      text:'test',
     *      html:'<p>Hello</p>',
     *      children:[{
     *          tag:'div#id_child.class.class2',
     *          css:{opacity:'1', height:'200px'},
     *          text:'test',
     *          html:'<p>World</p>'
     *      }]
     *  });
     *
     * @param   {String|Object} spec
     *
     * @return  {HTMLElement}
     */
    function _buildDOM(spec) {
        // Spec Defaults
        if (spec === null) {
            spec = 'div';
        }
        if (typeof spec === 'string') {
            spec = {
                tag: spec
            };
        }
        var el, classSelector;
        var fragment = document.createDocumentFragment();
        var children = spec.children;
        var selector = R_SELECTOR.exec(spec.tag || '');

        delete spec.children;

        spec.tag = selector[1] || 'div';
        spec.id = spec.id || (selector[2] || '').substr(1);
        // split ClassNames
        classSelector = (selector[3] || '').split('.');
        classSelector[0] = (spec.className || '');
        spec.className = classSelector.join(' ');


        el = document.createElement(spec.tag);
        _appendChild(fragment, el);
        delete spec.tag;

        // For every
        // key => spec[key];
        _each(spec, function(value, key) {
            if (key === 'css') {
                _css(el, spec.css);
            } else if (key === 'text') {
                (value !== null) && _appendChild(el, document.createTextNode(value));
            } else if (key === 'html') {
                (value !== null) && (el.innerHTML = value);
            } else if (key in el) {
                try {
                    el[key] = value;
                } catch (e) {
                    el.setAttribute(key, value);
                }
            } else if (/^data-/.test(key)) {
                el.setAttribute(key, value);
            }
        });
        // if the children is already an HTML Element, append it to el
        if (children && children.appendChild) {
            _appendChild(el, children);
        } else if (children) {
            if (children instanceof Array) {
                _each(children, function(value, key) {
                    if(value instanceof Object) {
                        _appendChild(el, _buildDOM(value));
                    }
                });
            } else if (children instanceof Object) {
                _appendChild(el, _buildDOM(children));
            }
        }
        return el;
    }
    /**
     * appendChild
     *
     * @param   {HTMLElement}   parent
     * @param   {HTMLElement}   el
     */
    function _appendChild(parent, el) {
        try {
            parent && el && parent.appendChild(el);
        } catch (e) {}
    }
    /**
     * Focus First Item in Parent Node
     * submit > text,password > button
     *
     * @param  {HTMLElement}    parentNode
     */
    function _autoFocus(parentNode) {
        var items = _getElementsByTagName(parentNode, 'input');
        var i = 0;
        var n = items.length;
        var el, element;

        for (; i < n; i++) {
            el = items[i];

            if (el.type === 'submit') {
                !element && (element = el);
            } else if (!/hidden|check|radio/.test(el.type) && el.value === '') {
                element = el;
                break;
            }
        }

        if (!element) {
            element = _getElementsByTagName(parentNode, 'button')[0];
        }

        try {
            element.focus();
        } catch (err) {}
    }
    /**
     * get Elements with Tag () from Parent
     *
     * @param   {HTMLElement}  el
     * @param   {String}       name
     *
     * @return  {NodeList}
     */
    function _getElementsByTagName(el, name) {
        return el.getElementsByTagName(name);
    }
    /**
     * remove Element from Parent
     *
     * @param   {HTMLElement}   el
     */
    function _removeElement(el) {
        if (el && el.parentNode) {
            el.parentNode.removeChild(el);
        }
    }

    return function(options) {
        var _popupS = {};
        var dialogs = {};
        var isOpen  = false;
        var queue   = [];
        // Match image file
        var R_IMG = new RegExp( /([^\/\\]+)\.(jpg|jpeg|png|gif)$/i );

        options = _deepExtend(_defaults, options);
        options.closeBtn = (
            typeof options.closeBtn != 'undefined' && typeof options.closeBtn == 'string' ? {
                tag: '#popupS-close.' + options.baseClassName + '-close' + options.addClassName.closeBtn,
                html: options.closeBtn
            } : {
                tag: 'span#popupS-close.' + options.baseClassName + '-close' + options.addClassName.closeBtn,
                html: '&times;'
            }
        );
        var tempOptions              = _extend({}, options);
            tempOptions.addClassName = _extend({}, options.addClassName);
            tempOptions.closeBtn     = _extend({}, options.closeBtn);
            tempOptions.flags        = _extend({}, options.flags);
            tempOptions.labels       = _extend({}, options.labels);

        var markup = {
            buttons: {
                holder: "<nav class=\""+options.baseClassName+"-buttons "+ options.addClassName.buttonHolder +"\">{{buttons}}</nav>",
                submit: "<button type=\"submit\" class=\""+options.baseClassName+"-button-ok "+ options.addClassName.buttonOk +"\" id=\"popupS-button-ok\">{{ok}}</button>",
                ok:     "<button class=\""+options.baseClassName+"-button-ok "+ options.addClassName.buttonOk +"\" id=\"popupS-button-ok\">{{ok}}</button>",
                cancel: "<button class=\""+options.baseClassName+"-button-cancel "+ options.addClassName.buttonCancel +"\" id=\"popupS-button-cancel\">{{cancel}}</button>"
            },
            input : "<div class=\""+options.baseClassName+"-form "+ options.addClassName.form +"\">{{placeholder}}<input type=\"text\" id=\"popupS-input\" /></div>"
        }

        _popupS = {
            /**
             * First instance of the function Object
             * Calls the Initialization and pushes every item to the Queue
             *
             * @param   {Object}    opt
             * @return  {Object}    popupS Object
             */
            _dialog: function (opt) {
                //error catching
                if (typeof opt.mode !== "string") throw new Error("mode must be a string");
                if (typeof opt.title !== "undefined" && typeof opt.title !== "string") throw new Error("title must be a string");
                if (typeof opt.placeholder !== "undefined" && typeof opt.placeholder !== "string") throw new Error("placeholder must be a string");
                // when additional options are defined
                this._tempOverrideOptions(opt);
                //initialize if it hasn't already been done
                this._init();
                if (opt.force === true){
                    while (queue.length > 0) { queue.pop(); }
                }
                queue.push(opt);
                if (!isOpen) this._create();
            },
            /**
             * Temporarily override the options of the Class
             * stores the regular options in an variable
             */
            _tempOverrideOptions: function(opt) {
                tempOptions              = _extend({}, options);
                tempOptions.addClassName = _extend({}, options.addClassName);
                tempOptions.closeBtn     = _extend({}, options.closeBtn);
                tempOptions.flags        = _extend({}, options.flags);
                tempOptions.labels       = _extend({}, options.labels);
                if(opt.options && !tempOptions) {
                    options = _deepExtend(options, opt.options);
                } else {
                    options = tempOptions;
                    tempOptions = undefined;
                }
            },
            /**
             * Initialization of the main elements
             */
            _init: function () {
                // if i passed a opacity attribute to the layer onClose, remove it on initialization
                if(this.$layerEl && this.$layerEl.style.opacity) this.$layerEl.style.opacity = "";
                if(!this.$wrapEl){
                    this.$wrapEl = _buildDOM({
                        tag: 'div.' + options.baseClassName + '-base'+options.addClassName.base,
                        css: {
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            position: 'fixed',
                            textAlign: 'center',
                            overflowX: 'auto',
                            overflowY: 'auto',
                            outline: 0,
                            whiteSpace: 'nowrap',
                            zIndex: options.zIndex
                        },
                        children: {
                            css: {
                                height: '100%',
                                display: 'inline-block',
                                verticalAlign: 'middle'
                            }
                        }
                    });
                    _appendChild(this.$wrapEl, this._getOverlay());
                    _appendChild(this.$wrapEl, this._getLayer());
                }
            },
            /**
             * initialize and get the overlay element
             *
             * @returns {HTMLElement}   $overlayEl
             */
            _getOverlay: function () {
                if (!this.$overlayEl) {
                    this.$overlayEl = _buildDOM({
                        tag: '#popupS-overlay.' + options.baseClassName + '-overlay'+options.addClassName.overlay,
                        css: {
                            top: 0,
                            right: 0,
                            bottom: 0,
                            left: 0,
                            position: 'fixed',
                            overflowX: 'hidden',
                            userSelect: 'none',
                            webkitUserSelect: 'none',
                            MozUserSelect: 'none'
                        }
                    });
                }
                this.$overlayEl.setAttribute("unselectable", "on");
                return this.$overlayEl;
            },
            /**
             * initialize and get the layer element
             *
             * @returns {HTMLElement}   layerEl
             */
            _getLayer: function () {
                if(!this.$layerEl){
                    this.$layerEl = _buildDOM({
                        css: {
                            display: 'inline-block',
                            position: 'relative',
                            textAlign: 'left',
                            whiteSpace: 'normal',
                            verticalAlign: 'middle',
                            transform: 'translate3d(0,0,0)'
                        },
                        children: {
                            tag: '.' + options.baseClassName + '-layer'+options.addClassName.popup
                        }
                    });
                }
                return this.$layerEl;
            },
            /**
             * resets the layer element
             */
            _resetLayer: function(){
                this.$layerEl.childNodes[0].innerHTML = '';
            },
            /**
             * Second instance. Takes the first item from the queue
             * creates or overwrites the Overlay and adds Events.
             * @calls createPopup with the current item.
             */
            _create: function () {
                var self = this;
                var item = queue[0];
                var mode = item.mode;
                var isOpen = true;
                // Creates the Popup. Overwrites the old one if one exists.
                if (mode != 'modal-ajax') {
                    this._createPopup(item);
                } else {
                    this._loadContents(item);
                }
                // this is very important for the callback function.
                // these lines make sure callbacks on the same function object will be displayed.
                var transitionDone = function(event) {
                    event.stopPropagation();
                    _unbind(self.$layerEl, transition.type, transitionDone);
                };
                if(transition.supported){
                    _bind(self.$layerEl, transition.type, transitionDone);
                }
            },
            /**
             * creates the Popup from the given Item.
             * it generates the HTML through createLayer
             * appends the popup at the target Location
             * and adds initial opening classes for opening animation
             *
             * TODO : Buttons and Inputs as BuildDOM Objects
             *
             * @param   {Object}    item
             */
            _createPopup: function(item) {
                var btnReset, btnResetBack;
                var mode = item.mode;
                var title = item.title;
                var content = item.content;
                var placeholder = (item.placeholder) ? '<label for=\"popupS-input\">'+item.placeholder+'</label>' : '';
                var className = (item.className)?'.'+item.className:'';
                var contentObj = ((content instanceof Object)?true:false);
                var html = "";

                this.callbacks = {
                    onOpen: item.onOpen,
                    onSubmit: item.onSubmit,
                    onClose: item.onClose
                };

                if (typeof content === 'string') html += content;
                if (mode != 'modal' && mode != 'modal-ajax'){
                    if (mode == 'prompt') {
                        html += markup.input;
                        html = html.replace("{{placeholder}}", placeholder);
                    }
                    html += markup.buttons.holder;
                    switch (mode) {
                        case "prompt":
                        case "confirm":
                            html = html.replace("{{buttons}}", this._appendButtons(markup.buttons.cancel, markup.buttons.ok));
                            html = html.replace("{{ok}}", options.labels.ok).replace("{{cancel}}", options.labels.cancel);
                            break;
                        default:
                            html = html.replace("{{buttons}}", markup.buttons.ok);
                            html = html.replace("{{ok}}", options.labels.ok);
                            break;
                    }
                }
                content = _buildDOM({
                    children:[{
                            tag:'a#popupS-resetFocusBack.'+options.baseClassName+'-resetFocus',
                            href:'#',
                            text:'Reset Focus'},
                        (options.flags.showCloseBtn && options.closeBtn),
                        (title && {
                            tag:        'h5.'+options.baseClassName+'-title'+className,
                            text:       title
                        }),{
                            tag:        '.'+options.baseClassName+'-content'+className,
                            html:       html,
                            children:(contentObj && content)
                        },{
                            tag:'a#popupS-resetFocus.'+options.baseClassName+'-resetFocus',
                            href:'#',
                            text:'Reset Focus'}]
                });
                this._resetLayer();
                _appendChild(this.$layerEl.childNodes[0], content);
                this._appendPopup();
                this.$contentEl = this.$layerEl.getElementsByClassName(options.baseClassName+'-content')[0];

                // bind the Event Functions to this
                this._resetEvent  = this._resetEvent.bind(this);
                this._okEvent     = this._okEvent.bind(this);
                this._cancelEvent = this._cancelEvent.bind(this);
                this._commonEvent = this._commonEvent.bind(this);
                this._keyEvent    = this._keyEvent.bind(this);

                btnReset = document.getElementById('popupS-resetFocus');
                btnResetBack = document.getElementById('popupS-resetFocusBack');
                // handle reset focus link
                // this ensures that the keyboard focus does not
                // ever leave the dialog box until an action has
                // been taken
                _bind(btnReset, 'focus', this._resetEvent);
                _bind(btnResetBack, 'focus', this._resetEvent);
                // focus the first input in the layer Element
                _autoFocus(this.$layerEl);
                // make sure which buttons or input fields are defined for the EventListeners
                this.$btnOK = document.getElementById('popupS-button-ok') || undefined;
                if(typeof this.$btnOK !== "undefined") _bind(this.$btnOK, "click", this._okEvent);
                this.$btnCancel = document.getElementById('popupS-button-cancel') || undefined;
                if(typeof this.$btnCancel !== "undefined") _bind(this.$btnCancel, "click", this._cancelEvent);
                this.$input = document.getElementById('popupS-input') || undefined;

                // eventlisteners for overlay and x
                if (options.flags.showCloseBtn)    _bind(document.getElementById('popupS-close'), "click", this._cancelEvent);
                if (options.flags.closeByOverlay)  _bind(this.$overlayEl, "click", this._cancelEvent);
                // listen for keys
                if (options.flags.closeByEsc)      _bind(document.body, "keyup", this._keyEvent);

                if(typeof this.callbacks.onOpen === "function") this.callbacks.onOpen.call(this);
            },
            /**
             * Appends the wrapper element to the target location
             */
            _appendPopup : function(){
                // Determine the target Element and add the Element to the DOM
                this.$targetEl = options.appendLocation;
                _appendChild(this.$targetEl, this.$wrapEl);
                // append the element level style for overflow if the option was set.
                if ((this.$targetEl === (document.body || document.documentElement)) && options.flags.bodyScroll === false) {
                    _css(this.$targetEl, {
                        overflow: 'hidden'
                    });
                }
                // after adding elements to the DOM, use computedStyle
                // to force the browser to recalc and recognize the elements
                // that we just added. This is so that our CSS Animation has a start point.
                if(window.getComputedStyle) window.getComputedStyle(this.$wrapEl, null).height;
                var classReg = function (className) {
                    return new RegExp("(|\\s+)" + className + "(\\s+|$)");
                };
                // if the class *-open doesn't exists in the wrap Element append it.
                if (!(classReg(' ' + options.baseClassName + '-open').test(this.$wrapEl.className))) {
                    this.$wrapEl.className += ' ' + options.baseClassName + '-open';
                }
                if (!(classReg(' ' + options.baseClassName + '-open').test(this.$layerEl.childNodes[0].className))) {
                    this.$layerEl.childNodes[0].className += ' ' + options.baseClassName + '-open';
                }
            },
            /**
             * sets the state of the loading Layer
             * and appends it to the Dom
             *
             * @param   {Bool}  state
             */
            _loading: function(state) {
                this.$loadingEl = _buildDOM({
                    tag: 'div.' + options.baseClassName + '-loading.' + options.loader
                });
                if (state){
                    this._resetLayer();
                    _css(this.$layerEl.childNodes[0],{
                        height: '60px',
                        width: '60px',
                        borderRadius: '30px'
                    });
                    _appendChild(this.$layerEl.childNodes[0], this.$loadingEl);
                    this._appendPopup();
                } else {
                    _css(this.$layerEl.childNodes[0],{
                        height: null,
                        width: null,
                        borderRadius: null
                    });
                }
            },
            /**
             * Hides the latest element in the stack
             * and creates the next one
             *
             * @param  {Function}   fn
             */
            _hide: function () {
                var self = this,
                    removeWrap,
                    transitionDone,
                    transitionDoneLayer;
                    // remove item from queue
                    queue.splice(0,1);
                    // check if last item in queue
                    if (queue.length > 0) this._create();
                    else{
                        isOpen = false;
                        removeWrap = function () {
                            // remove the wrap element from the DOM
                            _removeElement(self.$wrapEl);
                            // remove the element level style for overflow if the option was set.
                            if ((self.$targetEl === (document.body || document.documentElement)) && options.flags.bodyScroll === false) {
                                if (self.$targetEl.style.removeProperty) {
                                    self.$targetEl.style.removeProperty('overflow');
                                } else {
                                    self.$targetEl.style.removeAttribute('overflow');
                                }
                            }
                        };
                        transitionDone = function (event){
                            event.stopPropagation();
                            // unbind event so function only gets called once
                            _unbind(self.$wrapEl, transition.type, transitionDone);
                            // remove the Element from the DOM after Transition is Done
                            removeWrap();
                        };
                        transitionDoneLayer = function (event) {
                            event.stopPropagation();
                            // unbind event so function only gets called once
                            _unbind(self.$layerEl, transition.type, transitionDone);
                        };
                        // removes the open class from the wrap & layer Element
                        // and adds an EventListener to this Element
                        // which removes it from the DOM after the Transition is done.
                        this.$wrapEl.className = this.$wrapEl.className.replace(' ' + options.baseClassName + '-open', '');
                        if (transition.supported){
                            _bind(this.$wrapEl, transition.type, transitionDone);
                        } else {
                            removeWrap();
                        }
                        this.$layerEl.childNodes[0].className = this.$layerEl.childNodes[0].className.replace(' ' + options.baseClassName + '-open', '');
                        if (transition.supported) _bind(this.$layerEl, transition.type, transitionDoneLayer);
                    }
            },



            ///////////////
            //// Async ////
            ///////////////



            /**
             * load Asynchronous Files
             * can be Images or Files via Ajax
             *
             * @param   {Object}    item
             */
            _loadContents: function(item) {
                var url = item.ajax.url,
                    str = (typeof item.ajax.str != "undefined")? item.ajax.str : '',
                    post = (typeof item.ajax.post != "undefined")? item.ajax.post : true,
                    self = this;

                // Match image file
                if (url.match(R_IMG)) {//.exec(url) !== null
                    // Create the image Element, not visible
                    var imgElement = _buildDOM({
                        children: {
                            tag :   'img',
                            src :   url
                        }
                    });
                    this._loading(true);
                    this._preLoadImage(imgElement, function(){
                        self._loading(false);
                        item.content = imgElement;
                        self._createPopup(item);
                    });
                } else {
                    // get url via ajax
                    this._ajax(url, str, post, function(e){
                        // turn the result in a HTMLElement
                        var ajaxElement = _buildDOM({
                            html: this
                        });
                        // check if the newly created HTMLElement got any Images within it.
                        self._preLoadImage(ajaxElement, function(){
                            self._loading(false);
                            item.content = ajaxElement;
                            self._createPopup(item);
                        });
                    }, function(){
                        //before Sending
                        self._loading(true);
                    });
                }
            },
            /**
             * preload asynchronously
             *
             * all images contained in that Element
             *
             * @param   {HTMLElement}   parentNode
             * @param   {Function}      callback
             */
            _preLoadImage : function(parentNode, callback) {
                var items = _getElementsByTagName(parentNode, 'img'),
                    i = items.length,
                    queue = i,
                    img,
                    self = this,
                    complete = function (){
                        if(--queue <= 0){
                            i = items.length;
                            while(i--){
                                img = items[i];
                                _unbind(img, 'load', complete);
                                _unbind(img, 'error', complete);
                            }
                            callback();
                        }
                    };

                while (i--){
                    img = items[i];
                    //in case the're already cached by the browser decrement queue
                    if(img.complete) {
                        queue--;
                    } else {
                        _bind(img, 'load', complete);
                        _bind(img, 'error', complete);
                    }
                }
                //in case the're already cached by the browser
                !queue && complete();
            },
            /**
             * ajax request
             * with callback and beforeSend
             *
             * @param   {String}    filename
             * @param   {String}    str
             * @param   {Bool}      post
             * @param   {Function}  callback
             * @param   {Function}  beforeSend
             */
            _ajax: function(filename, str, post, callback, beforeSend) {
                var ajax;
                if (window.XMLHttpRequest){
                    ajax=new XMLHttpRequest();//IE7+, Firefox, Chrome, Opera, Safari
                } else if (ActiveXObject("Microsoft.XMLHTTP")){
                    ajax=new ActiveXObject("Microsoft.XMLHTTP");//IE6/5
                }else if (ActiveXObject("Msxml2.XMLHTTP")){
                    ajax=new ActiveXObject("Msxml2.XMLHTTP");//other
                }else{
                    alert("Error: Your browser does not support AJAX.");
                    return false;
                }
                ajax.onreadystatechange=function(){
                    if (ajax.readyState==4&&ajax.status==200){
                        if (callback) callback.call(ajax.responseText);
                    }
                };
                if(post===false) {
                    ajax.open("GET",filename+str,true);
                    ajax.send(null);
                } else {
                    ajax.open("POST",filename,true);
                    ajax.setRequestHeader("Content-type","application/x-www-form-urlencoded");
                    ajax.send(str);
                }
                if(beforeSend) beforeSend.call();
                return ajax;
            },



            ////////////////
            //// Events ////
            ////////////////



            //ok event handler
            _okEvent: function(event) {
                // preventDefault
                if (typeof event.preventDefault !== "undefined") event.preventDefault();
                // call the callback onSubmit if one is defined. this references to _popupS
                if(typeof this.callbacks.onSubmit === "function") {
                    if(typeof this.$input !== "undefined") {
                        this.callbacks.onSubmit.call(this, this.$input.value);
                    } else {
                        this.callbacks.onSubmit.call(this);
                    }
                }
                // hide popup and detach event handlers
                this._commonEvent();
            },
            // cancel event handler
            _cancelEvent: function(event) {
                if (typeof event.preventDefault !== "undefined") event.preventDefault();
                // call the callback onClose if one is defined. this references to _popupS
                if(typeof this.callbacks.onClose === "function") {
                    this.callbacks.onClose.call(this);
                }
                this._commonEvent();
            },
            // common event handler (keyup, ok and cancel)
            _commonEvent: function() {
                if (options.flags.closeByEsc) _unbind(document.body, "keyup", this._keyEvent);
                if (options.flags.closeByOverlay) _unbind(this.$overlayEl, "click", this._cancelEvent);
                this._hide();
            },
            // reset focus to first item in the popup
            _resetEvent: function(event) {
                _autoFocus(this.$layerEl);
            },
            // keyEvent Listener for Enter and Escape
            _keyEvent: function(event) {
                var keyCode = event.keyCode;
                if(typeof this.$input !== "undefined" && keyCode === 13) this._okEvent(event);
                if(keyCode === 27) this._cancelEvent(event);
            },



            ///////////////
            //// To-Do ////
            ///////////////



            /**
             * Append button HTML strings
             *
             * @param   {String}        secondary
             * @param   {String}        primary
             *
             * @return  {String}
             */
            _appendButtons: function (secondary, primary) {
                return options.flags.buttonReverse ? primary + secondary : secondary + primary;
            }
        };
        return {
            window: function(parameters) {
                if(!(parameters instanceof Object)) throw new Error('givven parameter must be an object');
                _popupS._dialog(parameters);
            },
            close: function() {
                _popupS._commonEvent();
            },
            alert: function() {

            },
            confirm: function() {

            },
            prompt: function() {

            },
            modal: function() {

            }
        };
    };
}))