sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function(
	JSONModel
) {
	"use strict";

	return {
        /**
         * @returns {sap.ui.model.json.JSONModel}
         * @description load data from data.json file
         */
        createProductModel: function() {
            const oProductModel = new JSONModel()
            const sDataURL = "model/data.json"
            oProductModel.loadData(sDataURL)
            return oProductModel
        },

        /**
         * @param {object} oModel model of porducts data
         * @returns {sap.ui.model.json.JSONModel} JsonModel of categories(id, name) object.
         * @description Loop through the all category object and get unique ones.
         * Create jsonModel and return it.
         */
        getAllCategory: function(oModel) {
            const aProducts = oModel.getProperty("/products")
            const aCategories = []

            const aAllCategory = aProducts.reduce((acc, product) => {
                return acc.concat(product.categories)
            }, [])
            
            aAllCategory.forEach(category => {
                if(!aCategories.some(cat => cat.id === category.id)) {
                    aCategories.push(category)
                }
            })
            return new JSONModel({categories: aCategories})
        },

        /**
         * @param {object} oModel model of products data.
         * @description Loop products and get all suppliers. 
         * Loop suppliers and get Uniques.
         * create new JSONModel and return it.
         */
        getAllSupplier: function(oModel) {
            const aProducts = oModel.getProperty("/products")
            const aSuppliers = []

            const aAllSupplier = aProducts.reduce((acc, product) => {
                return acc.concat(product.suppliers)
            }, [])
            
            aAllSupplier.forEach(supplier => {
                if(!aSuppliers.some(sup => sup.id === supplier.id)) {
                    aSuppliers.push(supplier)
                }
            })
 
            return new JSONModel({suppliers: aSuppliers})
        }
    }
});