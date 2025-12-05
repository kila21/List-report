sap.ui.define([
    "sap/ui/core/UIComponent",
    "project1/model/models",
    "project1/model/productModel"
], (UIComponent, models, productModel) => {
    "use strict";

    return UIComponent.extend("project1.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // initialize products model for application
            const oProductsModel = productModel.createProductModel()
            this.setModel(oProductsModel, "productsModel")

            // enable routing
            this.getRouter().initialize();
        }
    });
});