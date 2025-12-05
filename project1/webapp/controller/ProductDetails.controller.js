sap.ui.define([
    "project1/controller/BaseController",
    "project1/model/formatter",
    "project1/model/constants",
    "project1/model/productModel",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
    "sap/ui/core/Messaging",
	"sap/ui/core/message/Message",
	"sap/ui/core/message/MessageType",
    "sap/base/util/uid"
], (
    BaseController,
    formatter,
    constants,
    productModel,
    JSONModel,
    MessageToast,
    Messaging,
    Message,
    MessageType,
    UID
) => {
    "use strict";

    return BaseController.extend("project1.controller.ProductDetails", {
        formatter: formatter,
        _sID: "",
        oFragment: null,

        /**
         * On component init call attachPaterMatched.
         * @override
         */
        onInit() {
            this.getRouter().getRoute("RouteProductDetails").attachPatternMatched(this._onRouteMatched, this)
        },

        /**
         * Fetch Countries for suppliers input And do some init stuff when route is matched.
         * @private
         * @param {sap.ui.base.Event} oEvent
         */
        _onRouteMatched: async function(oEvent) {
            const oCountries = await productModel.fetchCountries()
            if (oCountries) {
                this.setModel(oCountries, "countriesModel")
            }

            const oModel = this.getModel("productsModel")

            const oEditModeModel = new JSONModel({editable: false})
            this.setModel(oEditModeModel, "viewStateModel")

            const oCategories = productModel.getAllCategory(oModel)
            this.setModel(oCategories, "categoriesModel")

            this._sID = oEvent.getParameter("arguments").productID

            if (this._sID === 'new') {
                this._clearUI()
            } else {
                this._bindObjectToView(oModel)
            }

            Messaging.removeAllMessages()

            const oView = this.getView()
            this.setModel(Messaging.getMessageModel(), "message");
            Messaging.registerObject(oView, true)
        },

        /**
		 * On input change event. Calls checkValidation method.
		 * @param {sap.ui.base.Event} oEvent 
		 */
		onDetailsInputChange: function(oEvent) {
			this._checkDetailsInputValidations(oEvent.getSource())
		},

        /**
		 * Checks the validation of the inputs. If Valid return true.
		 * @private
		 * @param {object} oInput input object
		 * @returns {boolean}
		 */
		_checkDetailsInputValidations: function(oInput) {
			const sInputName = oInput.getName()
			const sInputValue = oInput.getValue()
			let sMessage = ""

            const oDetailsModel = this.getModel("detailsFormModel")

			oInput.setValueState(constants.VALUESTATE.ERROR)

			if(sInputName === constants.DETAILSSECTIONINPUTNAMES.NAME && sInputValue.length === 0) {
                sMessage = this.getI18nText("detailsNameValidation")
			} else if (sInputName === constants.DETAILSSECTIONINPUTNAMES.DESCRIPTION && (sInputValue.length > 50 || !sInputValue)) {
                sMessage = this.getI18nText("detailsDescriptionValidation", [sInputValue.length])
			} else if (sInputName === constants.DETAILSSECTIONINPUTNAMES.RATING && (!Number(sInputValue) || Number(sInputValue) > 5 || Number(sInputValue) < 1)) {
                sMessage = this.getI18nText("detailsRatingValidation")
			} else if (sInputName === constants.DETAILSSECTIONINPUTNAMES.PRICE && !Number(sInputValue) && !sInputValue) {
                sMessage = this.getI18nText("detailsPriceValidation")
			} else if (sInputName === constants.DETAILSSECTIONINPUTNAMES.CATEGORY && oInput.getSelectedKeys().length === 0) {
                sMessage = this.getI18nText("detailsCategoryValidation")
			} else {
				this._removeMessage(sInputName)
				sMessage = ""
				oInput.setValueState(constants.VALUESTATE.NONE)
				return true
			}

            this._createMessage(sInputName, sMessage, oDetailsModel)
            return false
		},
        
        /**
         * Create Empty object and Update suppliersModel
         * @returns {void}
         */
		onSuppliersCreateButtonPress: function() {
			const aSuppliers = this.getModel("suppliersModel").getProperty("/suppliers")

			const oEmptyFormData = {
                id: UID(),
				name: "",
				country: "",
				city: "",
				street: "",
				state: "",
				zipCode: null,
				saveNew: true,
			}

			aSuppliers.unshift(oEmptyFormData)
			this.getModel("suppliersModel").setProperty("/suppliers", [...aSuppliers])
		},

        /**
         * On Change Event check Validation of Input.
         * @param {sap.ui.base.Event} oEvent 
         * @returns 
         */
        onSuppliersInputChange: function (oEvent) {
            this._onSuppliersInputValidation(oEvent.getSource())
        },
        
        /**
         * Opens MessagePopover.
         * @param {sap.ui.base.Event} oEvent
         * @returns {void}
         */
        onMessagePopoverPress: async function(oEvent) {
			const oSourceControl = oEvent.getSource();
            
            if (!this.oFragment) {
                this.oFragment = this.loadFragment({
                    name: "project1.view.fragments.MessagePopover"
                })
            }
            
            this.oFragment.then(function(oPopOver) {
                oPopOver.openBy(oSourceControl);
            })
		},

        /**
         * Change state of the view. From read-only to Edit Mode.
         * If the View is already in Edit Mode, Notify user about it.
         * @returns {void}
         */
        onEditButtonPress: function() {
            const oEditModel = this.getModel("viewStateModel")
            const bEditable = oEditModel.getProperty("/editable")

            if (!bEditable) {
                oEditModel.setProperty("/editable", true)
            } else {
                MessageToast.show(this.getI18nText("textEditWarning"))
            }
        },

        /**
         * Validate new Supplier.
         * saves the changes to the local model.
         * Saves the changes to the Main model And set view to Read-Only Mode.
         * @returns {void}
         */
        onSaveButtonPress: function() {
            let bValid = false
            let oData = {}
            let sPath = null
            const oModel = this.getModel("productsModel")

            const aSuppliersID = this._getSuppliersInput()
            const aValids = aSuppliersID.filter(oInput => !this._onSuppliersInputValidation(oInput))
            const aDetailsValid = this._getDetailsInput().filter(oInput => !this._checkDetailsInputValidations(oInput))

            if (aValids.length === 0 && aDetailsValid.length === 0) {
                bValid = true
            }
            
            if (!bValid) {
                MessageToast.show(this.getI18nText("textFixErrors"))
                return 
            }

            if (!(this._sID === 'new')) {
                sPath = this.getView().getBindingContext("productsModel").getPath()
            }

            oData = this._updateModels()
            
            if (this._sID === 'new') {
                const aUpdatedProducts = productModel.createProduct(oModel, oData)
                const sNewProductID = aUpdatedProducts[0].id
                oModel.setProperty("/products", aUpdatedProducts)
                this.navTo("RouteProductDetails", {productID: sNewProductID}, true)
            } else {
                oModel.setProperty(sPath, oData)
            }

            this.byId("idFeedInput").setValue(null)
            this.getModel("viewStateModel").setProperty("/editable", false)
            MessageToast.show(this.getI18nText("textProductSaveSuccessfully"))
        },

        /**
         * Cancel all current changes And Switch view to Read-Only Mode.
         * @returns {void}
         */
        onCancelButtonPress: function() {
            if (this._sID === 'new' ) {
                this.navTo("RouteProductList", {}, true)
                return
            }

            const oSuppliersModel = this.getModel("suppliersModel")
            const oProductsModel = this.getModel("productsModel")
            const oCommentsModel = this.getModel("commentsModel")
            
            const oCurrentProduct = oProductsModel
                .getProperty("/products")
                .filter(oItem => oItem.id === this._sID)[0]

            const aOriginalCategoriesID = oCurrentProduct.categories.map(oItem => oItem.id)
            const aOriginalSuppliers = oCurrentProduct.suppliers
            const aOriginalComments = oCurrentProduct.comments
            
            if (oCurrentProduct) {
                const oDetailsModel = new JSONModel({
                    name: oCurrentProduct.name,
                    description: oCurrentProduct.description,
                    rating: oCurrentProduct.rating,
                    releaseDate: oCurrentProduct.releaseDate,
                    discountDate: oCurrentProduct.discountDate,
                    price: oCurrentProduct.price,
                    categories: aOriginalCategoriesID
                })
                this.setModel(oDetailsModel, "detailsFormModel")

                oSuppliersModel.setProperty("/suppliers", [...aOriginalSuppliers])
                oCommentsModel.setProperty("/comments", [...aOriginalComments])
                this.byId("idFeedInput").setValue(null)
            }

            Messaging.removeAllMessages()
            this.getModel("viewStateModel").setProperty("/editable", false)
            MessageToast.show(this.getI18nText("textProductChangesCancel"))
        },

        /**
         * Deletes the product and navigates to the List-report page.
         * @returns {void}
         */
        onDeleteButtonPress: function () {
            const sID = this.getView().getBindingContext("productsModel").getObject()
            const oModel = this.getModel("productsModel")

            const aUpdatedArray = productModel.deleteProducts(oModel, [sID.id])

            oModel.setProperty("/products", aUpdatedArray)
            this.navTo("RouteProductList", {}, true)
        },

        /**
         * Delete supplier on locally.Until Save button.
         * @param {sap.ui.base.Event} oEvent 
         */
        onSupplierDeleteButtonPress: function(oEvent) {
            const oItem = oEvent.getParameter("listItem")
            const sID = oItem.getBindingContext("suppliersModel").getObject().id;
            
            const oSuppliersModel = this.getModel("suppliersModel")
            const aSuppliersModel = oSuppliersModel.getProperty("/suppliers")
            
            const aUpdatedSuppliers = aSuppliersModel.filter(oItem => oItem.id !== sID)
            
            oSuppliersModel.setProperty("/suppliers", [...aUpdatedSuppliers])
        },

        /**
         * @param {sap.ui.base.Event} oEvent
         */
        onFeedInputPost: function(oEvent) {
            const oCommentsModel = this.getModel("commentsModel")
            const aComments = oCommentsModel.getProperty("/comments")

            const sComment = oEvent.getParameter("value")

            if (!sComment) {
                MessageToast.show(this.getI18nText("textWarningForComment"))
                return
            }

            aComments.unshift({
                id: "com__00" + aComments.length,
                comment: sComment
            })

            oCommentsModel.setProperty("/comments", aComments)
        },

        /**
         * Fired when country input suggestion is selected. And set new model for city.
         * @param {sap.ui.base.Event} oEvent
         */
        onCountryInput: async function(oEvent) {
            const sSelectedCountry = oEvent.getParameter("selectedItem").getText()
            if (sSelectedCountry) {
                const oCapital = await productModel.fetchCapital(sSelectedCountry)
                this.setModel(oCapital, "capitalModel")
            }
        },

        /**
         * Checks the Suppliers input validation.
         * @private
         * @param { object } oInput
         * @returns {boolean}
         */
        _onSuppliersInputValidation: function (oInput) {
            const sInputName = oInput.getName()
            const sInputValue = oInput.getValue()

            if (sInputName === "city") {
                return true
            }

            const oModel = this.getModel("suppliersModel")
            oInput.setValueState(constants.VALUESTATE.ERROR)
            
            if (sInputName && sInputValue.length === 0) {
                const sMessage = this.getI18nText("suppliersValidationMessage", [sInputName])
                this._createMessage("suppliers/0/" + sInputName, sMessage, oModel)
                return false
            }else {
                this._removeMessage("suppliers/0/" + sInputName)
                oInput.setValueState(constants.VALUESTATE.NONE)
                return true
            }
        },

        /**
		 * Create new message and add it to the Message popover.
		 * @private
		 * @param {string} sInputName Name of the input
		 * @param {string} sMessage Message to add.
         * @param {sap.ui.model.json.JSONModel} oModel
		 */
		_createMessage: function(sInputName, sMessage, oModel) {
			const oMessage = new Message({
				message: sMessage,
				type: MessageType.Error,
				target: `/${sInputName}`,
				processor: oModel
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

        /**
         * Get all Suppliers input And Return it.
         * @private
         * @returns {Array}
         */
        _getSuppliersInput: function() {
            const oTable = this.byId("idSuppliersTable");
            const aAllInputs = oTable.getControlsByFieldGroupId("supplierInputs")

            const aInputs = aAllInputs.filter(oInput => oInput.getVisible() && oInput.isA("sap.m.Input"))
            return aInputs;
        },

        /**
         * Get all Detail Section input.
         */
        _getDetailsInput: function() {
            const aInputs = [
                this.byId("idDetailsNameInput"),
                this.byId("idDetailsDescriptionInput"),
                this.byId("idDetailsRatingInput"),
                this.byId("idDetailsReleaseDateInput"),
                this.byId("idDetailsDiscountDateInput"),
                this.byId("idDetailsPriceInput"),
                this.byId("idDetailsCategoriesInput")
            ]
            return aInputs
        },

        /**
         * When route dynamic id is 'new', clears the ui set local models to empty values.
         * @returns {void}
         */
        _clearUI: function() {
            this.getView().unbindElement("productsModel");
            this.getModel("viewStateModel").setProperty("/editable", true)

            const oDetailsEmpty = {
                name: "",
                description: "",
                rating: null,
                releaseDate: "",
                discountDate: "",
                price: null,
                categories: []
            }

            this.setModel(new JSONModel(oDetailsEmpty), "detailsFormModel")
            this.setModel(new JSONModel({suppliers: []}), "suppliersModel")
            this.setModel(new JSONModel({comments: []}), "commentsModel")
        },

        /**
         * Bind Element to the view and update the models for view at Init.
         * @param {object} oModel
         */
        _bindObjectToView: function (oModel) {
            let aProducts = []
            let oCurrentProduct = null

            if(oModel) {
                aProducts = oModel.getProperty("/products")
                const sPath = aProducts.findIndex(oItem => oItem.id === this._sID)
                this.getView().bindElement({
                    path: '/products/' + sPath,
                    model: "productsModel"
                })
                oCurrentProduct = aProducts[sPath]
            }

            if (oCurrentProduct) {
                const aCurrentCategories = oCurrentProduct.categories.map(oItem => oItem.id)
                const oProductDetailsFormModel = new JSONModel({
                        name: oCurrentProduct.name,
                        description: oCurrentProduct.description,
                        rating: oCurrentProduct.rating,
                        releaseDate: oCurrentProduct.releaseDate,
                        discountDate: oCurrentProduct.discountDate,
                        price: oCurrentProduct.price,
                        categories: aCurrentCategories
                })
                this.setModel(oProductDetailsFormModel, "detailsFormModel")

                const aCurrentSuppliers = oCurrentProduct.suppliers
                const oSuppliersModel = new JSONModel({suppliers: [...aCurrentSuppliers]})
                this.setModel(oSuppliersModel, "suppliersModel")

                const aCurrentComments = oCurrentProduct.comments
                const oCommentsModel = new JSONModel({comments: [...aCurrentComments]})
                this.setModel(oCommentsModel, "commentsModel")
            }
        },

        /**
         * @returns {object}
         */
        _updateModels: function() {
            const oSuppliers = this.getModel("suppliersModel")
            const aSuppliers = oSuppliers.getProperty("/suppliers")

            const oDetailsFormModelData = this.getModel("detailsFormModel").getData()
            const aAllCategory = this.getModel("categoriesModel").getProperty("/categories")

            const aComments = this.getModel("commentsModel").getProperty("/comments")

            const aDetailsCategories = [...oDetailsFormModelData.categories]

            const aUpdatedSuppliers = aSuppliers.map(oSup => {
                delete oSup.saveNew
                return oSup
            }) 

            const aUpdatedCategories = aDetailsCategories.map(sID => {
                return aAllCategory.find(oItem => oItem.id === sID)
            })

            oSuppliers.setProperty("/suppliers", aUpdatedSuppliers)

            return {
                id: this._sID,
                name : oDetailsFormModelData.name,
                description : oDetailsFormModelData.description,
                rating : Number(oDetailsFormModelData.rating),
                price : Number(oDetailsFormModelData.price),
                releaseDate : oDetailsFormModelData.releaseDate,
                discountDate : oDetailsFormModelData.discountDate,
                categories: [...aUpdatedCategories],
                suppliers: [...aUpdatedSuppliers],
                comments : aComments
            }
        }
    });
})