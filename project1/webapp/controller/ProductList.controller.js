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
        
        onInit() {
            // products model
            const oProductsModel = productModel.createProductModel()
            this.setModel(oProductsModel, "productsModel")

            // for delete button on the view. default is false.
            const oModel = new JSONModel({
                deleteEnabled: false
            })
            this.setModel(oModel, "deleteButtonModel")
        },

        onProductsTableSelectionChange: function(oEvent) {
            const oTable = oEvent.getSource()
            const iSelectedItems = oTable.getSelectedItems().length
            
            this.getModel("deleteButtonModel").setProperty('/deleteEnabled', !!iSelectedItems)
        }
    });
});