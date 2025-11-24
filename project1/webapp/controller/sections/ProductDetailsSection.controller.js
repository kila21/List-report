sap.ui.define([
	"project1/controller/BaseController",
	"project1/model/productModel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Messaging",
	"sap/ui/core/message/Message",
	"sap/ui/core/message/MessageType"
], function(
	BaseController,
	productModel,
	JSONModel,
	Messaging,
	Message,
	MessageType
) {
	"use strict";

	return BaseController.extend("project1.controller.sections.ProductDetailsSection", {

		/**
		 * @override
		 * @returns {void|undefined}
		 */
		onInit: function() {
			this.getRouter().getRoute("RouteProductDetails").attachPatternMatched(this._onRouteMatched, this)
		},

		/**
		 * Route Matched method.
		 * Create local model for categories dropdown. 
		 * Create local model for Form.
		 * @param {sap.ui.base.Event} oEvent 
		 */
		_onRouteMatched: function(oEvent) {
			const oModel = this.getModel("productsModel")
			const oData = oModel.getData().products
			const sID = oEvent.getParameter("arguments").productID

			const oCategories = productModel.getAllCategory(oModel)
            this.setModel(oCategories, "categoriesModel")

			const oCurrentProduct = oData && oData.filter(oProduct => oProduct.id === sID)[0]
			const aCategoriesID = oCurrentProduct.categories.map(oItem => oItem.id)

			if(oCurrentProduct) {
				const oFormModel = new JSONModel({
					name: oCurrentProduct.name,
					description: oCurrentProduct.description,
					rating: oCurrentProduct.rating,
					releaseDate: oCurrentProduct.releaseDate,
					discountDate: oCurrentProduct.discountDate,
					price: oCurrentProduct.price,
					categories: aCategoriesID
				})
				this.setModel(oFormModel, "detailsFormModel")
			}
		},

		/**
		 * On input change event. Calls checkValidation method.
		 * @param {sap.ui.base.Event} oEvent 
		 */
		onInputChange: function(oEvent) {
			this._checkValidation(oEvent.getSource())
		},

		/**
		 * Checks the validation of the inputs. If Valid return true.
		 * @private
		 * @param {object} oInput input object
		 * @returns {boolean}
		 */
		_checkValidation: function(oInput) {
			const sInputName = oInput.getName()
			const sInputValue = oInput.getValue()
			let sMessage = ""

			oInput.setValueState("Error")

			if(sInputName === 'name' && sInputValue.length === 0) {
				sMessage = "Name is Required."
				this._createMessage(sInputName, sMessage)
				return false
			} else if (sInputName === 'description' && (sInputValue.length > 50 || !sInputValue)) {
				sMessage = "Description is Required And Max length is 50. " + "Chars: " + sInputValue.length
				this._createMessage(sInputName, sMessage)
				return false
			} else if (sInputName === 'rating' && (!Number(sInputValue) || Number(sInputValue) > 5 || Number(sInputValue) < 1)) {
				sMessage = "Choose between 1 and 5"
				this._createMessage(sInputName, sMessage)
			} else if (sInputName === 'price' && !Number(sInputValue) && !sInputValue) {
				sMessage = "Price is required"
				this._createMessage(sInputName, sMessage)
			} else if (sInputName === 'categories' && oInput.getSelectedKeys().length === 0) {
				sMessage = "Choose At lease one Category."
				this._createMessage(sInputName, sMessage)
			} else {
				this._removeMessage(sInputName)
				sMessage = ""
				oInput.setValueState("None")
				return true
			}
		},
		
		/**
		 * Create new message and add it to the Message popover.
		 * @private
		 * @param {string} sInputName Name of the input
		 * @param {string} sMessage Message to add.
		 */
		_createMessage: function(sInputName, sMessage) {
			const oMessage = new Message({
				message: sMessage,
				type: MessageType.Error,
				target: `/${sInputName}`,
				processor: this.getModel("detailsFormModel")
			});
			Messaging.addMessages(oMessage);
		},

		/**
		 * Removes message from the message popover.
		 * @param {string} sTarget 
		 */
		_removeMessage: function (sTarget) {
			Messaging.getMessageModel().getData().forEach(
				function(oMessage){
					if (oMessage.target === "/" + sTarget) {
						Messaging.removeMessages(oMessage);
					}
				}.bind(this)
			);
		},
	});
});