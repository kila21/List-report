sap.ui.define([
    "project1/controller/BaseController",
    "project1/model/formatter"
], (BaseController, formatter) => {
    "use strict";

    return BaseController.extend("project1.controller.ProductDetails", {

        formatter: formatter,

        onInit() {
            this.getRouter().getRoute("RouteProductDetails").attachPatternMatched(this._onRouteMatched, this)
        },


        /**
         * On patter match, Find index depending on the productID and bind it to the view.
         * @private
         * @param {sap.ui.base.Event} oEvent
         */
        _onRouteMatched: function(oEvent) {
            const sProductID = oEvent.getParameter("arguments").productID
            const oModel = this.getModel("productsModel")
            
            if(oModel) {
                const aProducts = oModel.getProperty("/products")
                const sPath = aProducts.findIndex(oItem => oItem.id === sProductID)
                this.getView().bindElement({
                    path: '/products/' + sPath,
                    model: "productsModel"
                })
            }
        }
    });
})