sap.ui.define([
    "project1/controller/BaseController",
    "project1/model/productModel",
    "project1/model/formatter",
	"sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
], (
    BaseController,
	productModel,
	formatter,
	JSONModel,
	Fragment,
) => {
    "use strict";

    return BaseController.extend("project1.controller.ProductList", {
        formatter: formatter,
        _oDialog: null,
        /**
         * @override
         * @description set productsModal to the view.
         *              when request is Completed set categories and Suppliers Model.(filter options)
         *              set model for delete button.(Enabled or not)
         *              set model for filter options.
         */
        onInit() {
            // products model
            const oProductsModel = productModel.createProductModel()
            this.setModel(oProductsModel, "productsModel")

            // attach Event Once to set new model for categories from Data.json file.
            oProductsModel.attachEventOnce("requestCompleted", () => {
                const oCategories = productModel.getAllCategory(oProductsModel)
                this.setModel(oCategories, "categoriesModel")

                const oSuppliers = productModel.getAllSupplier(oProductsModel)
                this.setModel(oSuppliers, "suppliersModel")
            })

            // for delete button on the view. default is false.
            const oButtonModel = new JSONModel({
                deleteEnabled: false
            })
            this.setModel(oButtonModel, "deleteButtonModel")

            // for filter options.
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
         * @returns {void}
         * @description get table by id, get binding and get filters model
         *              create array of all filters together and bind it into items.
         */
        onFilterBarSearch: function() {
            const oTable = this.byId("idProductsTable")
            const oBinding = oTable.getBinding("items")

            const oFiltersModel = this.getModel("filtersModel")

            const aFilters = []

            // name---search input
            const sSearchValue = oFiltersModel.getProperty("/search")
            const aSearchFilter = productModel.onNameSearch(sSearchValue)
            if (aSearchFilter.length > 0) {
                aFilters.push(...aSearchFilter)
            }

            // category---multiComboBox
            const aSelectedKeys = oFiltersModel.getProperty("/multiComboBox")
            const oCategoriesFilter = productModel.onMultiComboBox(aSelectedKeys)
            if (oCategoriesFilter) {
                aFilters.push(oCategoriesFilter)
            }

            // releaseDate---Date-picker
            const oReleaseDate = oFiltersModel.getProperty("/releaseDate")
            const oDateFilter = productModel.onReleaseDate(oReleaseDate.startDate, oReleaseDate.endDate)
            if (oDateFilter) {
                aFilters.push(oDateFilter)
            }

            // suppliers---input with suggestions.
            const sSuppliersValue = oFiltersModel.getProperty("/suppliers")
            const oSuppliersFilter = productModel.onSuppliersSearch(sSuppliersValue)
            if(oSuppliersFilter) {
                aFilters.push(oSuppliersFilter)
            }

            // add filters
            oBinding.filter(aFilters)
        },
        
        /**
         * @description create new init model JSON and set it inot filtersModel.
         *              call onFilterBarSearch method to bind no filters.
         */
        onFilterBarClear: function() {
            // clear selections of table.
            this._clearTableSelectedItems()
            this._deleteButtonEnable(false)

            // init model for filters
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
         * @param {Event} oEvent 
         * @description check if selected items are and set property of delete button.
         */
        onProductsTableSelectionChange: function(oEvent) {
            const oTable = oEvent.getSource()
            const iSelectedItems = oTable.getSelectedItems().length

            this._deleteButtonEnable(!!iSelectedItems)
        },

        /**
         * @param {sap.ui.base.Event} oEvent press event on button
         * @description map through the selectedItems on table and get Context,
         *              call confirm delete.
         */
        onDeleteButtonPress: async function(oEvent) {
            let sProductName = ""
            const aSelectedItems = this._getSelectedItemsFromTable()

            aSelectedItems.map(product => {
                const oObject = product.getBindingContext("productsModel").getObject()
                sProductName = oObject.name
                return oObject
            })
            await this._openConfirmDeleteDialog(aSelectedItems.length, sProductName)
        },

        /**
         * @private 
         * @param {Integer} iCount length of selected items.
         * @param {string} [sName] name of product item. optional parameter.
         * @description open the delete dialog. Items from the table.
         */
        _openConfirmDeleteDialog: async function(iCount, sName) {
            this._oDialog ??= await this.loadFragment({
                name: "project1.view.fragments.ConfirmDelete"
            })
            
            const oText = this.byId("idConfirmDeleteText")
            if (iCount === 1 && sName) {
                oText.setText(`Do you really want to delete product ${sName}?`)
            } else {
                oText.setText(`Do you really want to delete ${iCount} products?`)
            }
            this._oDialog.open()
        },

        /**
         * @description Confirm that user wants to delete items.
         *              delete items with an id. inside productsModel.
         *              clear Table checkmarks and close dialog.
         */
        onYesButtonConfirmDeletePress: function() {
            const aSelectedItems = this._getSelectedItemsFromTable()
            const aID = aSelectedItems.map(
                product => product.getBindingContext("productsModel").getObject().id
            )
            const oModel = this.getModel("productsModel")
            const aUpdatedProducts = productModel.deleteProducts(oModel, aID)

            if(aUpdatedProducts) {
                oModel.setProperty("/products", aUpdatedProducts)
                this._clearTableSelectedItems()
                this._deleteButtonEnable(false)
                this.onNoButtonCloseDialogPress()
            }
        },

        /**
         * @private
         * @param {boolean} bEnable true if button is enable, false if not.
         * @description change state of button of delete 
         */
        _deleteButtonEnable: function(bEnable) {
            this.getModel("deleteButtonModel").setProperty(
                "/deleteEnabled", bEnable)
        },

        /**
         * @private
         * @returns {Array} Array of selectedItems.(LIstBase)
         * @description get table by id.
         *              get Selected Items from table and return data.
         */
        _getSelectedItemsFromTable: function() {
            const oTable = this.byId("idProductsTable")
            return oTable.getSelectedItems()  
        },

        /**
         * @private
         * @description removes Selections for table.
         */
        _clearTableSelectedItems: function() {
            const oTable = this.byId("idProductsTable")
            oTable.removeSelections()
        },

        /**
         * @description close the dialog. when clicking No Button.
        */
        onNoButtonCloseDialogPress: function() {
            this._oDialog.close()
        },
    }); 
});