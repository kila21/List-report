sap.ui.define([
	"sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter"
], function(
	JSONModel,
    Filter,
    FilterOperator,
    Sorter
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
        },

        /**
         * @param {object} oModel model of products.
         * @param {Array} aID array of product id.
         * @description filter products data with an id.
         * @returns {Array} array of updeted products.
         */
        deleteProducts: function(oModel, aID) {
            const aProducts = oModel.getProperty("/products")
            const aUpdatedProducts = aProducts.filter(product => !aID.includes(product.id))
            return aUpdatedProducts
        },

        /**
         * @param {string} sValue string of search query
         * @returns {Array} Array of filter options.
         * @description Search Filter, For product names.
         */
        onNameSearch: function(sValue) {
            const aFilter = []
            if (sValue) {
                aFilter.push(new Filter("name", FilterOperator.Contains, sValue))
            }
            return aFilter
        },

        /**
         * @param {Array} aKeys array of selected keys.
         * @returns {object || null}
         * @description check if keys are selected, if not return null.
         * filter products with category id. and return new filter object for MultiComboBox.
         */
        onMultiComboBox: function(aKeys) {
            // If no keys selected, don't create a filter
            if (!aKeys || !Array.isArray(aKeys) || aKeys.length === 0) {
                return null
            }
            // custom filter
            const oFilter = new Filter({
                path: "categories",
                test: function(aCategories) {
                    return aCategories.some(cat => aKeys.includes(cat.id))
                }
            })
            return oFilter
        },

        /**
         * @param {Date} startDate 
         * @param {Date} dDate
         * @returns {object || null} filter object or  null.
         * @description get start and end date toISOString. and return new filter for DateRangeSelection.
         */
        onReleaseDate: function(startDate, endDate) {
            if(startDate && endDate) {
                const dStart = startDate.toISOString()
                const dEnd = endDate.toISOString()
                return new Filter({
                    path: "releaseDate",
                    operator: FilterOperator.BT,
                    value1: dStart,
                    value2: dEnd,
                })
            } else return null
        },

        /**
         * @param {string} sValue value of input field with suggestion.
         * @returns {object || null} object of new filter
         * @description create new custom filter object for suppliers and return it.
         */
        onSuppliersSearch: function(sValue) {
            if (sValue) {
                return new Filter({
                    path: "suppliers",
                    test: function(aSuppliers) {
                        return aSuppliers.some(sup => sup.name.toLowerCase().includes(sValue.toLowerCase()))
                    }
                })
            }
            return null
        },

        /**
         * @param {string} sProperty value of sort property
         * @param {boolean} bDescending
         * @returns {sap.ui.model.Sorter}
         * @description create sort operation depending on property and descending value.
         */
        onSort: function(sProperty, bDescending) {
            return new Sorter(sProperty, bDescending)
        }
    }
});