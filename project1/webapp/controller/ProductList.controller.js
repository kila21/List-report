sap.ui.define([
    "project1/controller/BaseController",
    "project1/model/productModel",
    "project1/model/formatter",
	"sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment"
], (
    BaseController,
	productModel,
	formatter,
	JSONModel,
	Fragment
) => {
    "use strict";

    return BaseController.extend("project1.controller.ProductList", {
        formatter: formatter,
        _oDialog: null,
        /**
         * @override
         * @description
         * set productsModal to the view.
         * when request is Completed set categories and Suppliers Model.(filter options)
         * set model for delete button.(Enabled or not)
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
            const oModel = new JSONModel({
                deleteEnabled: false
            })
            this.setModel(oModel, "deleteButtonModel")
        },

        /**
         * @param {Event} oEvent 
         * @description check if selected items are and set property of delete button.
         */
        onProductsTableSelectionChange: function(oEvent) {
            const oTable = oEvent.getSource()
            const iSelectedItems = oTable.getSelectedItems().length
            if(iSelectedItems > 0) {
                this.getModel("deleteButtonModel").setProperty("/deleteEnabled", true)
            }else {
                this.getModel("deleteButtonModel").setProperty("/deleteEnabled", false)
            }
        },

        /**
         * @param {sap.ui.base.Event} oEvent press event on button
         * @description 
         * get Table by id
         * get Selected Items (multiSelect mode Table)
         * get Selected Items Data.
         */
        onDeleteButtonPress: async function(oEvent) {
            let sProductName = ""

            const oTable = this.byId("idProductsTable")
            const aSelectedItems = oTable.getSelectedItems()
            const aSelectedItemsData = aSelectedItems.map(c => {
                const oObject = c.getBindingContext("productsModel").getObject()
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
         * @description close the dialog. when clicking No Button.
         */
        onNoButtonCloseDialogPress: function() {
            this._oDialog.close()
        }
    }); 
});