sap.ui.define([
    "project1/controller/BaseController",
    "project1/model/productModel",
    "project1/model/formatter",
	"sap/ui/model/json/JSONModel"
], (
    BaseController,
	productModel,
	formatter,
	JSONModel
) => {
    "use strict";

    return BaseController.extend("project1.controller.ProductList", {
        formatter: formatter,
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
                this.getModel("deleteButtonModel").setProperty('/deleteEnabled', true)
            }else {
                this.getModel("deleteButtonModel").setProperty('/deleteEnabled', false)
            }
        }
    });
});