sap.ui.define([
    "project1/controller/BaseController",
    "project1/model/formatter",
    "project1/model/productModel",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
    "sap/ui/core/Messaging",
], (
    BaseController,
    formatter,
    productModel,
    JSONModel,
    MessageToast,
    Messaging
) => {
    "use strict";

    return BaseController.extend("project1.controller.ProductDetails", {

        formatter: formatter,

        onInit() {
            this.getRouter().getRoute("RouteProductDetails").attachPatternMatched(this._onRouteMatched, this)
        },

        /**
         * On patter match, Find index depending on the productID and bind it to the view.
         * Create local model for Edit Mode.
         * Create local model for Validations.
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

            const oEditModeModel = new JSONModel({editable: false})
            this.setModel(oEditModeModel, "viewStateModel")

            Messaging.removeAllMessages()
            const oView = this.getView()
            this.setModel(Messaging.getMessageModel(), "message");
            Messaging.registerObject(oView, true)
        },

        
        /**
         * Opens MessagePopover.
         * @param {sap.ui.base.Event} oEvent 
         */
        onMessagePopoverPress: async function(oEvent) {
			const oSourceControl = oEvent.getSource();
			const oMessagePopover = this.byId("idMessagePopover")
			oMessagePopover.openBy(oSourceControl);
		},

        /**
         * Change state of the view. From read-only to Edit Mode.
         * If the View is already in Edit Mode, Notify user about it.
         * @returns {void}
         */
        onEditButtonPress: function() {
            const oEditModel = this.getModel("viewStateModel")
            const bEditable = oEditModel.getProperty("/editable")

            if (!bEditable) oEditModel.setProperty("/editable", true)
            else MessageToast.show("You are Already in Edit Mode. Save Changes Or Click Cancel.")
        },

        /**
         * Saves the changes And set view to Read-Only Mode.
         * @returns {void}
         */
        onSaveButtonPress: function() {
            this.getModel("viewStateModel").setProperty("/editable", false)
            MessageToast.show("Product Details Saved Successfully.")
        },

        /**
         * Cancel all current changes And Switch view to Read-Only Mode.
         * @returns {void}
         */
        onCancelButtonPress: function() {
            this.getModel("viewStateModel").setProperty("/editable", false)
            MessageToast.show("All Current Changes are canceled.")
        },

        /**
         * Deletes the product and navigates to the List-report page.
         * @returns {void}
         */
        onDeleteButtonPress: function (oEvent) {
            const sID = this.getView().getBindingContext("productsModel").getObject()
            const oModel = this.getModel("productsModel")

            const aUpdatedArray = productModel.deleteProducts(oModel, [sID.id])

            if (aUpdatedArray) {
                oModel.setProperty("/products", aUpdatedArray)
                this.navTo("RouteProductList")
            }
        }
    });
})