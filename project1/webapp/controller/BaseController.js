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
         */
        getOwnerComponent: function() {
            return Controller.prototype.getOwnerComponent.call(this);
        },

        /**
         * @returns {sap.ui.core.routing.Router}
         */
        getRouter : function () {
            return UIComponent.getRouterFor(this);
        },
    
        /**
         * @param {string} sName name of the model
         * @returns {sap.ui.model.Model | undefined}
         */
        getModel: function(sName) {
            return this.getView().getModel(sName)
        },

        /**
         * @param {object} oModel object for new model
         * @param {string} sName name of the model
         * @returns {sap.ui.core.mvc.View}
         */
        setModel: function(oModel, sName) {
            return this.getView().setModel(oModel, sName)
        },

        /**
         * 
         * @param {string} sName 
         * @param {object} [oParameters] 
         * @param {boolean} [bReplace] 
         */
        navTo: function(sName, oParameters, bReplace) {
            this.getRouter().navTo(sName, oParameters, undefined, bReplace)
        }
	});
});