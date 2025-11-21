sap.ui.define([
	"sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent"
], function(
	Controller,
    UIComponent
) {
	"use strict";

	return Controller.extend("project1.controller.BaseController", {
        /**
         * @override
         * @returns {sap.ui.core.Component | undefined}
         * @description Return the owner component instance for this controller.
         */
        getOwnerComponent: function() {
            return Controller.prototype.getOwnerComponent.call(this);
        },

        /**
         * @returns {sap.ui.core.routing.Router}
         * @description helper function that returns the router instance
         *              associated with this controller (used for navigation).
         */
        _getRouter : function () {
            return UIComponent.getRouterFor(this);
        },
    
        /**
         * @param {string} sName name of the model
         * @returns {sap.ui.model.Model | undefined}
         * @description Read a model from the view by its name. If `sName` is
         *              omitted the default model is returned.
         */
        getModel: function(sName) {
            return this.getView().getModel(sName)
        },

        /**
         * @param {object} oModel plain object
         * @param {string} sName name of the model to set on the view
         * @returns {sap.ui.core.mvc.View} the view instance (for chaining)
         * @description Set a model on the view.
         */
        setModel: function(oModel, sName) {
            return this.getView().setModel(oModel, sName)
        },

        /**
         * Navigate to a named route using the router.
         * @param {string} sName route name
         * @param {object} [oParameters] optional route parameters (key/value)
         * @param {boolean} [bReplace=false] whether to replace the current history entry
         * @description Wrapper around router.navTo to simplify route navigation
         *              from controllers. `oParameters` is forwarded to the router
         *              and `bReplace` controls history replacement.
         */
        navTo: function(sName, oParameters, bReplace) {
            this._getRouter().navTo(sName, oParameters, undefined, bReplace)
        }
	});
});