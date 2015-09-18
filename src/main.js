;(function (root, factory) {

    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.popupS = factory();
    }

}(this, function () {
    'use strict';

    var isOpen = false,
        queue  = [];

    // Match image file
    var R_IMG = new RegExp( /([^\/\\]+)\.(jpg|jpeg|png|gif)$/i );

    var _defaults = require('defaults');

    var transition = require('transition');

    /**
     * @class   PopupS
     * @param   {Object}    options
     */
    function PopupS(options) {
        //error catching
        if (typeof options.mode !== "string") throw new Error("mode must be a string");
        if (typeof options.title !== "undefined" && typeof options.title !== "string") throw new Error("title must be a string");
        if (typeof options.placeholder !== "undefined" && typeof options.placeholder !== "string") throw new Error("placeholder must be a string");

        this.options = options = _extend({}, options);

        // Set default options
        for (var name in _defaults) {
            !(name in options) && (options[name] = _defaults[name]);
        }

        // trail all classes divided by periods
        _each(['additionalBaseClass', 'additionalButtonHolderClass', 'additionalButtonOkClass', 'additionalButtonCancelClass', 'additionalCloseBtnClass', 'additionalFormClass', 'additionalOverlayClass', 'additionalPopupClass'], function(option) {
            var string = options[option].split(' ').join('.');
            options[option] = '.' + string;
        });

        // Bind all private methods
        for (var fn in this) {
            if (fn.charAt(0) === '_') {
                this[fn] = _bind(this, this[fn]);
            }
        }

        //initialize if it hasn't already been done
        this._init();

        // if it is forced, close all others
        if(options.force === true) {
            while (queue.length > 0) queue.pop();
        }
        queue.push(options);
        if(!isOpen) this._create();
    }

    PopupS.prototype = require('./prototype');

    require('./utils');
    require('css');
    require('dom');

    /**
     * Create popupS instance
     * @param   {Object}    params
     */
    PopupS.window = function(params) {
        return new PopupS(params);
    };
    PopupS.alert = function(params) {
        params = _extend(params, {mode: 'alert'});
        return new PopupS(params);
    };
    PopupS.confirm = function(params) {
        params = _extend(params, {mode: 'confirm'});
        return new PopupS(params);
    };
    PopupS.prompt = function(params) {
        params = _extend(params, {mode: 'prompt'});
        return new PopupS(params);
    };
    PopupS.modal = function(params) {
        params = _extend(params, {mode: 'modal'});
        return new PopupS(params);
    };
    PopupS.ajax = function(params) {
        params = _extend(params, {mode: 'modal-ajax'});
        return new PopupS(params);
    };

    // Export
    return PopupS;
}));
