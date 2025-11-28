sap.ui.define([
	"sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
], function(
	JSONModel,
	Filter,
	FilterOperator,
	Sorter
) {
	"use strict";
	return {
        /**
         * Load data from data.json file and Return it.
         * @returns {sap.ui.model.json.JSONModel}
         */
        createProductModel: function() {
            const oProductModel = new JSONModel()
            const sDataURL = sap.ui.require.toUrl("project1") + "/model/data.json";
            oProductModel.loadData(sDataURL)
            return oProductModel
        },

        /**
         * Loop through the all category object and get unique ones.
         * Create jsonModel and return it.
         * @param {sap.ui.model.json.JSONModel} oModel model of products data
         * @returns {sap.ui.model.json.JSONModel}
         */
        getAllCategory: function(oModel) {
            const aProducts = oModel.getProperty("/products")
            const aCategories = []

            const aAllCategory = aProducts.reduce((aAcc, oProduct) => {
                return aAcc.concat(oProduct.categories)
            }, [])
            
            aAllCategory.forEach(oCategory => {
                if(!aCategories.some(oCat => oCat.id === oCategory.id)) {
                    aCategories.push(oCategory)
                }
            })
            return new JSONModel({categories: aCategories})
        },

        /**
         * Loop through the all suppliers object and get uniques.
         * Create new JSONModel and return it.
         * @param {sap.ui.model.json.JSONModel} oModel model of products data.
         * @returns {sap.ui.model.json.JSONModel}
         */
        getAllSupplier: function(oModel) {
            const aProducts = oModel.getProperty("/products")
            const aSuppliers = []

            const aAllSupplier = aProducts.reduce((aAcc, oProduct) => {
                return aAcc.concat(oProduct.suppliers)
            }, [])
            
            aAllSupplier.forEach(oSupplier => {
                if(!aSuppliers.some(sup => sup.id === oSupplier.id)) {
                    aSuppliers.push(oSupplier)
                }
            })
            return new JSONModel({suppliers: aSuppliers})
        },

        /**
         * Create new Product
         * @param {sap.ui.model.json.JSONModel} oModel model of products.
         * @param {object} oPorduct new product object
         */
        createProduct: function(oModel, oProduct) {
            const aProducts = oModel.getProperty("/products")
            oProduct.id = "prod_0" + (aProducts.length + 1)
            aProducts.unshift(oProduct)

            return aProducts
        },

        /**
         * Filter products data with an id And Delete.
         * @param {sap.ui.model.json.JSONModel} oModel model of products.
         * @param {string[]} aID array of product ids.
         * @returns {Object[]} array of updated product objects.
         */
        deleteProducts: function(oModel, aID) {
            const aProducts = oModel.getProperty("/products")
            const aUpdatedProducts = aProducts.filter(oProduct => !aID.includes(oProduct.id))
            return aUpdatedProducts
        },

        /**
         * Search Filter for the products name.
         * @param {string} sValue string of search query
         * @returns {sap.ui.model.Filter[]} Array of filter objects.
         */
        onNameSearch: function(sValue) {
            const aFilter = []
            if (sValue) {
                aFilter.push(new Filter("name", FilterOperator.Contains, sValue))
            }
            return aFilter
        },

        /**
         * Filter funtionality for MultiComboBox.
         * @param {string[]} aKeys array of selected keys.
         * @returns {sap.ui.model.Filter || null}
         */
        onMultiComboBox: function(aKeys) {
            if (!aKeys || !Array.isArray(aKeys) || aKeys.length === 0) {
                return null
            }

            // custom filter
            const oFilter = new Filter({
                path: "categories",
                test: function(aCategories) {
                    return aCategories.some(oCat => aKeys.includes(oCat.id))
                }
            })
            return oFilter
        },

        /**
         * Get start and end date toISOString. and return new filter for DateRangeSelection.
         * @param {Date} dStartDate 
         * @param {Date} dEndDate
         * @returns {sap.ui.model.Filter || null}
         */
        onReleaseDate: function(dStartDate, dEndDate) {
            if(dStartDate && dEndDate) {
                const dStart = dStartDate.toISOString()
                const dEnd = dEndDate.toISOString()
                return new Filter({
                    path: "releaseDate",
                    operator: FilterOperator.BT,
                    value1: dStart,
                    value2: dEnd,
                })
            }
            return null
        },

        /**
         * create new custom filter object for suppliers and return it.
         * @param {string} sValue value of input field with suggestion.
         * @returns {sap.ui.model.Filter || null}
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
         * Create sorter operation depending on property and descending value And return.
         * Checks if property of sorting is rating, then grouping
         * @param {string} sProperty
         * @param {boolean} bDescending
         * @returns {sap.ui.model.Sorter}
         */
        onSort: function(sProperty, bDescending) {
            if (sProperty === 'rating') {
                return new Sorter(sProperty, bDescending, function(oContext) {
                    const iRating = oContext.getProperty('rating')
                    const sStars = "★".repeat(iRating);

                    return `${sStars} (${iRating} stars)`;   
                })
            }
            return new Sorter(sProperty, bDescending)
        },

        /**
         * Fetches country names from the API.
         * @returns {Array}
         */
        getCountriesSuggestions: async function() {
            try {
                return await fetch("/api/all?fields=name")
                .then(resp => resp.json())
                .then(aData => {
                    const aFilteredArray = aData.map(oItem => oItem.name.common)
                    return aFilteredArray
                })
            } catch (err) {
                console.error(err)
            }
        },
        /**
         * Fetche the Capital of the country from the API.
         * @param {string} sCountryName 
         * @returns {string} name of capital
         */
        getCitySuggestion: async function(sCountryName) {
            try {
                return await fetch(`/api/name/${sCountryName.toLowerCase()}?fields=capital`)
                .then(resp => resp.json())
                .then(aData => {
                    return aData[0].capital[0]
                })
            } catch (err) {
                console.error(err)
            }
        }
    }
});