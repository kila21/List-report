sap.ui.define([
    "project1/controller/BaseController",
    "project1/model/constants",
    "project1/model/productModel",
    "project1/model/formatter",
	"sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
], (
    BaseController,
	constants,
	productModel,
	formatter,
	JSONModel,
	MessageBox,
) => {
    "use strict";

    return BaseController.extend("project1.controller.ProductList", {
        formatter: formatter,

        /**
         * call the attachPatterMatch method.
         * @override
         */
        onInit() {
            this.getRouter().getRoute("RouteProductList").attachPatternMatched(this._onRouteMatched, this)
        },

        /**
         * Set categories and Suppliers Model.(filter options)
         * set model for delete button.(Enabled or not)
         * set model for filter options.
         * @returns {void}
         */
        _onRouteMatched: function () {
            const oProductsModel = this.getModel("productsModel")

            const oCategories = productModel.getAllCategory(oProductsModel)
            this.setModel(oCategories, "categoriesModel")

            const oSuppliers = productModel.getAllSupplier(oProductsModel)
            this.setModel(oSuppliers, "suppliersModel")
            

            const oDeleteButtonModel = new JSONModel({
                deleteEnabled: false
            })
            this.setModel(oDeleteButtonModel, "deleteButtonModel")

            const oFiltersModel = new JSONModel({
                search: '',
                multiComboBox: [],
                releaseDate: {
                    startDate: null,
                    endDate: null
                },
                suppliers: '',
            })
            this.setModel(oFiltersModel, "filtersModel")
        },

        /**
         * Filter functionality for filterbar options.Contains below filters: 
         * Search Filter for name.
         * Category Filter with Check marks (MultiComboBox).
         * Release Date Filter, with DateRangeSelection.
         * Suppliers Filter, Search with suggestions.
         * Finally bind it to the items.
         * @returns {void}
         */
        onFilterBarSearch: function() {
            const oTable = this.byId("idProductsTable")
            const oBinding = oTable.getBinding("items")
            const oFiltersModel = this.getModel("filtersModel")

            const aFilters = []

            const sSearchValue = oFiltersModel.getProperty("/search")
            const aSearchFilter = productModel.onNameSearch(sSearchValue)
            if (aSearchFilter.length > 0) {
                aFilters.push(...aSearchFilter)
            }

            const aSelectedKeys = oFiltersModel.getProperty("/multiComboBox")
            const oCategoriesFilter = productModel.onMultiComboBox(aSelectedKeys)
            if (oCategoriesFilter) {
                aFilters.push(oCategoriesFilter)
            }

            const oReleaseDate = oFiltersModel.getProperty("/releaseDate")
            const oDateFilter = productModel.onReleaseDate(oReleaseDate.startDate, oReleaseDate.endDate)
            if (oDateFilter) {
                aFilters.push(oDateFilter)
            }

            const sSuppliersValue = oFiltersModel.getProperty("/suppliers")
            const oSuppliersFilter = productModel.onSuppliersSearch(sSuppliersValue)
            if(oSuppliersFilter) {
                aFilters.push(oSuppliersFilter)
            }

            oBinding.filter(aFilters)
        },
        
        /**
         * Create Init object. And set it to the filtersModel.
         * And Call onFilterBarSearch, to update binding.
         * @returns {void}
         */
        onFilterBarClear: function() {
            const oInitFilterModel = new JSONModel({
                search: '',
                multiComboBox: [],
                releaseDate: {
                    startDate: null,
                    endDate: null
                },
                suppliers: '',
            })

            this.setModel(oInitFilterModel, "filtersModel")
            this.onFilterBarSearch()
        },

        /**
         * Click on the Sort button on the table calls the function. 
         * Which will handle: Icon change and sorting.
         * @param {sap.ui.base.Event} oEvent
        */
        onButtonSortPress: function(oEvent) {
            const oButton = oEvent.getSource()
            const sProperty = oButton.getCustomData()[0].getValue()
            const sCurrentIcon = oButton.getIcon()

            const oIconsObject = constants.SORTICONS
            
            let sNewIcon = ""
            let aSorted = []

            if (sCurrentIcon === oIconsObject.DEFAULT) {
                sNewIcon = oIconsObject.ASC
                aSorted = productModel.onSort(sProperty, false)
            } else if (sCurrentIcon === oIconsObject.ASC) {
                sNewIcon = oIconsObject.DESC
                aSorted = productModel.onSort(sProperty, true)
            } else if (sCurrentIcon === oIconsObject.DESC) {
                sNewIcon = oIconsObject.DEFAULT
                aSorted = null
            }

            this._resetSortIcon(oButton)

            oButton.setIcon(sNewIcon)
            const oBinding = this.byId("idProductsTable").getBinding("items")
            oBinding.sort(aSorted)
        },

        /**
         * It's Table SelectionChange event. Which finds out if there is selected items and depend on that enables button.
         * @param {sap.ui.base.Event} oEvent
         */
        onProductsTableSelectionChange: function(oEvent) {
            const oTable = oEvent.getSource()
            const iSelectedItems = oTable.getSelectedItems().length

            this._setDeleteButtonEnable(!!iSelectedItems)
        },

        /**
         * on Create new product. Navigate To object page.
         * 
         */
        onCreateButtonPress: function() {
            this.navTo("RouteProductDetails", {productID: 'new'})
        },

        /**
         * Check how many item are selected in the table and ask user for deletion with messageBox.
         * @param {sap.ui.base.Event} oEvent press event on button
         */
        onDeleteButtonPress: async function(oEvent) {
            let sProductName = ""
            let sMessage = ""
            const aSelectedItemsID = []
            const aSelectedItems = this._getSelectedItemsFromTable()

            aSelectedItems.map(oProduct => {
                const oObject = oProduct.getBindingContext("productsModel").getObject()
                sProductName = oObject.name
                aSelectedItemsID.push(oObject.id)
                return oObject
            })

            if (aSelectedItems.length === 1) {
                sMessage = this.getI18nText("messageForOneProduct", [sProductName])
            } else {
                sMessage = this.getI18nText("messageForMultiProducts", [aSelectedItems.length])
            }

            MessageBox.warning(sMessage, {
                actions: [MessageBox.Action.YES, MessageBox.Action.CLOSE],
                onClose: function(sAction) {
                    if (sAction === constants.MESSAGEBOXACTIONS.YES) {
                        this._onProductsDeletion(aSelectedItemsID)
                    }
                }.bind(this)
            });
        },

        /**
         * Delete the item and clear the UI.
         * @private
         * @param {Array} aSelectedItemsID
         * @returns {void}
         */
        _onProductsDeletion: function(aSelectedItemsID) {
            const oModel = this.getModel("productsModel")
            const aUpdatedProducts = productModel.deleteProducts(oModel, aSelectedItemsID)

            oModel.setProperty("/products", aUpdatedProducts)
            
            this._clearTableSelectedItems()
            this._setDeleteButtonEnable(false)
            
        },

        /**
         * Clicking on the item inside the table will navigate to the object page.
         * @param {sap.ui.base.Event} oEvent
         * 
         */
        onProductsTableItemPress: function(oEvent) {
            const sClickedID = oEvent.getParameter("listItem").getBindingContext("productsModel").getProperty("id")
            this.navTo("RouteProductDetails", {productID: sClickedID})
        },

        /**
         * Changes the state of button Delete
         * @private
         * @param {boolean} bEnable true if button is enable, false if not.
         */
        _setDeleteButtonEnable: function(bEnable) {
            this.getModel("deleteButtonModel").setProperty("/deleteEnabled", bEnable)
        },

        /**
         * Get Selected Items from the table and return It.
         * @private
         * @returns {sap.m.ColumnListItem[]} Array of selected items from the table
         */
        _getSelectedItemsFromTable: function() {
            const oTable = this.byId("idProductsTable")
            return oTable.getSelectedItems()  
        },

        /**
         * Removes Selections for the table.
         * @private
         * @returns {void}
         */
        _clearTableSelectedItems: function() {
            const oTable = this.byId("idProductsTable")
            oTable.removeSelections(true)
        },

        /**
         * Reset all button icon to the default.
         * @private
         * @param {sap.m.Button} oButton
         */
        _resetSortIcon: function(oButton) {
            const oTable = this.byId("idProductsTable")

            oTable.getColumns().forEach(oEl => {
                const oBtn = oEl.getHeader().getItems()[1]
                if(oButton && oBtn === oButton) {
                    return
                }
                oBtn.setIcon(constants.SORTICONS.DEFAULT)
            })
        }
    }); 
});