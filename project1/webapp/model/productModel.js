sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function(
	JSONModel
) {
	"use strict";

	return {
        /**
         * load data from data.json file
         * @returns {sap.ui.model.json.JSONModel}
         */
        createProductModel: function() {
            const oProductModel = new JSONModel()
            const sDataURL = "model/data.json"
            oProductModel.loadData(sDataURL)
            return oProductModel
        }
    }
});