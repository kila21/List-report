sap.ui.define([
	"project1/controller/BaseController",
	"project1/model/productModel",
	"sap/ui/model/json/JSONModel"
], function(
	BaseController,
	productModel,
	JSONModel
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

		}
	});
});