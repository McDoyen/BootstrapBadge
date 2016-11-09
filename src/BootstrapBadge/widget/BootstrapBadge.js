/* global logger*/
/*
    BootstrapBadge
    ========================

    @file      : BootstrapBadge.js
    @version   : 1.0.0
    @author    : Paul mcDoyen
    @date      : 11/4/2016
    @copyright : mcdoyen 2016
    @license   : Apache 2

    Documentation
    ========================
    Describe your widget here.
*/

// Required module list. Remove unnecessary modules, you can always get them back from the boilerplate.
define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",

    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",

    "BootstrapBadge/lib/jquery-1.11.2",
    "dojo/text!BootstrapBadge/widget/template/BootstrapBadge.html"
], function(declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, dojoLang, dojoText, dojoHtml, dojoEvent, _jQuery, widgetTemplate) {
    "use strict";

    var $ = _jQuery.noConflict(true);

    // Declare widget's prototype.
    return declare("BootstrapBadge.widget.BootstrapBadge", [_WidgetBase, _TemplatedMixin], {
        // _TemplatedMixin will create our dom node using this HTML template.
        templateString: widgetTemplate,

        // DOM elements
        inputNodes: null,
        badgeNode: null,
        buttonNode: null,

        // Parameters configured in the Modeler.
        badgeItemsAtt: "",
        badgeStyleAtt: "",
        onclickMf: "",
        classBar: "none",

        // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
        _handles: null,
        _contextObj: null,

        // dojo.declare.constructor is called to construct the widget instance. Implement to initialize non-primitive properties.
        constructor: function() {
            logger.debug(this.id + ".constructor");
            this._handles = [];
        },

        // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
        postCreate: function() {
            logger.debug(this.id + ".postCreate");
            if (this.classBar !== "none") {
                dojoClass.add(this.badge, "BootstrapBadge" + this.classBar);
            }
            this._updateRendering();
            this._setupEvents();
        },

        // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
        update: function(obj, callback) {
            logger.debug(this.id + ".update");
            this._contextObj = obj;
            this._resetSubscriptions();
            this._setClassBar(this._contextObj);
            this._setupEvents();
            this._setBadge(this._contextObj);
            this._updateRendering(callback);
            // We're passing the callback to updateRendering to be called after DOM-manipulation
        },

        _setBadge: function(object) {
            dojoHtml.set(this.buttonNode, this._contextObj.get(this.badgeItemsAtt));
        },

        _setClassBar: function(object) {
            var buttonType = "btn btn-";
            dojoClass.add(this.buttonNode, buttonType + this.classBar);
        },

        // We want to stop events on a mobile device
        _stopBubblingEventOnMobile: function(e) {
            logger.debug(this.id + "._stopBubblingEventOnMobile");
            if (typeof document.ontouchstart !== "undefined") {
                dojoEvent.stop(e);
            }
        },

        // Attach events to HTML dom elements
        _setupEvents: function() {
            logger.debug(this.id + "._setupEvents");
            this.connect(this.badgeNode, "click", function(e) {
                // Only on mobile stop event bubbling!
                this._stopBubblingEventOnMobile(e);

                // If a microflow has been set execute the microflow on a click.
                if (this.onclickMf !== "") {
                    mx.data.action({
                        params: {
                            applyto: "selection",
                            actionname: this.onclickMf,
                            guids: [this._contextObj.getGuid()]
                        },
                        store: { caller: this.mxformts },
                        callback: function(obj) {
                            // TODO what to do when all is ok!
                        },
                        error: dojoLang.hitch(this, function(error) {
                            logger.error(this.id + ": An error occurred while executing microflow: " + error.description);
                            mx.ui.error("Error while executing MicroFlow: " + this.onclickMf + " : " + error.message);
                        })
                    }, this);
                }
            });
        },

        // Rerender the interface.
        _updateRendering: function(callback) {
            this._setBadge(this._contextObj);
            logger.debug(this.id + "._updateRendering");
            //  this._setClassBar(this._contextObj);

            // The callback, coming from update, needs to be executed, to let the page know it finished rendering

            mendix.lang.nullExec(callback);
        },

        _unsubscribe: function() {
            if (this._handles) {
                dojoArray.forEach(this._handles, function(handle) {
                    mx.data.unsubscribe(handle);
                });
                this._handles = [];
            }
        },

        // Reset subscriptions.
        _resetSubscriptions: function() {
            logger.debug(this.id + "._resetSubscriptions");
            // Release handles on previous object, if any.
            this._unsubscribe();

            // When a mendix object exists create subscribtions.
            if (this._contextObj) {
                var objectHandle = mx.data.subscribe({
                    guid: this._contextObj.getGuid(),
                    callback: dojoLang.hitch(this, function(guid) {
                        this._updateRendering();
                    })
                });

                var attrHandle = mx.data.subscribe({
                    guid: this._contextObj.getGuid(),
                    attr: this.badgeItemsAtt,
                    callback: dojoLang.hitch(this, function(guid) {
                        this._updateRendering();
                    })
                });

                this._handles = [objectHandle, attrHandle];
            }
        }
    });
});

require(["BootstrapBadge/widget/BootstrapBadge"]);