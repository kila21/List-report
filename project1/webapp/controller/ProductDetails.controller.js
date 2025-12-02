sap.ui.define([
    "project1/controller/BaseController",
    "project1/model/formatter",
    "project1/model/constants",
    "project1/model/productModel",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
    "sap/ui/core/Messaging",
	"sap/ui/core/message/Message",
	"sap/ui/core/message/MessageType"
], (
    BaseController,
    formatter,
    constants,
    productModel,
    JSONModel,
    MessageToast,
    Messaging,
    Message,
    MessageType
) => {
    "use strict";

    return BaseController.extend("project1.controller.ProductDetails", {
        formatter: formatter,
        _sID: "",
        _oBundle: null,
        /**
         * On component init call attachPaterMatched.
         * @override
         */
        onInit() {
            this.getRouter().getRoute("RouteProductDetails").attachPatternMatched(this._onRouteMatched, this)
        },

        /**
         * Fetch Countries for suppliers input.
         * Find index depending on the productID and bind it to the view.
         * Create local model for Edit Mode.
         * Create model for suppliers Section.(fragment)
         * Create model for Details section and categories dropdown.
         * Create model for Comments Section.
         * Create model for Validations.
         * @private
         * @param {sap.ui.base.Event} oEvent
         */
        _onRouteMatched: function(oEvent) {
            this._fetchCountries()
            const oModel = this.getModel("productsModel")
            this._oBundle = this.getModel("i18n").getResourceBundle()

            const oEditModeModel = new JSONModel({editable: false})
            this.setModel(oEditModeModel, "viewStateModel")

            const oCategories = productModel.getAllCategory(oModel)
            this.setModel(oCategories, "categoriesModel")

            this._sID = oEvent.getParameter("arguments").productID

            if (this._sID === 'new') {
                this._clearUI()
            } else {
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

			oInput.setValueState(constants.ValueState.ERROR)

			if(sInputName === constants.DetailsSectionInputNames.NAME && sInputValue.length === 0) {
                sMessage = this._oBundle.getText("detailsNameValidation")
				this._createMessage(sInputName, sMessage, oDetailsModel)
				return false
			} else if (sInputName === constants.DetailsSectionInputNames.DESCRIPTION && (sInputValue.length > 50 || !sInputValue)) {
                sMessage = this._oBundle.getText("detailsDescriptionValidation", [sInputValue.length])
				this._createMessage(sInputName, sMessage, oDetailsModel)
				return false
			} else if (sInputName === constants.DetailsSectionInputNames.RATING && (!Number(sInputValue) || Number(sInputValue) > 5 || Number(sInputValue) < 1)) {
                sMessage = this._oBundle.getText("detailsRatingValidation")
				this._createMessage(sInputName, sMessage, oDetailsModel)
			} else if (sInputName === constants.DetailsSectionInputNames.PRICE && !Number(sInputValue) && !sInputValue) {
                sMessage = this._oBundle.getText("detailsPriceValidation")
				this._createMessage(sInputName, sMessage, oDetailsModel)
			} else if (sInputName === constants.DetailsSectionInputNames.CATEGORY && oInput.getSelectedKeys().length === 0) {
                sMessage = this._oBundle.getText("detailsCategoryValidation")
				this._createMessage(sInputName, sMessage, oDetailsModel)
			} else {
				this._removeMessage(sInputName)
				sMessage = ""
				oInput.setValueState(constants.ValueState.NONE)
				return true
			}
		},
        
        /**
         * Create Empty object and Update suppliersModel
         * @returns {void}
         */
		onSuppliersCreateButtonPress: function() {
			const aSuppliers = this.getModel("suppliersModel").getProperty("/suppliers")

			const oEmptyFormData = {
                id: this._generateSupplierID(),
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
            else MessageToast.show(this._oBundle.getText("textEditWarning"))
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
                MessageToast.show(this._oBundle.getText("textFixErrors"))
                return 
            }
            
            const oSuppliers = this.getModel("suppliersModel")
            const aSuppliers = oSuppliers.getProperty("/suppliers")
    
            const oDetailsFormModelData = this.getModel("detailsFormModel").getData()
            const aAllCategory = this.getModel("categoriesModel").getProperty("/categories")

            const aComments = this.getModel("commentsModel").getProperty("/comments")

            if (!(this._sID === 'new')) {
                sPath = this.getView().getBindingContext("productsModel").getPath()
            }

            const aDetailsCategories = [...oDetailsFormModelData.categories]
            const aUpdatedSuppliers = aSuppliers.map(oSup => {
                delete oSup.saveNew
                return oSup
            }) 

            const aUpdatedCategories = aDetailsCategories.map(sID => {
                return aAllCategory.find(oItem => oItem.id === sID)
            })

            // update
            oData = {
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
            
            oSuppliers.setProperty("/suppliers", aUpdatedSuppliers)
            
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
            MessageToast.show(this._oBundle.getText("textProductSaveSuccessfully"))
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
            MessageToast.show(this._oBundle.getText("textProductChangesCancel"))
        },

        /**
         * Deletes the product and navigates to the List-report page.
         * @returns {void}
         */
        onDeleteButtonPress: function () {
            const sID = this.getView().getBindingContext("productsModel").getObject()
            const oModel = this.getModel("productsModel")

            const aUpdatedArray = productModel.deleteProducts(oModel, [sID.id])

            if (aUpdatedArray) {
                oModel.setProperty("/products", aUpdatedArray)
                this.navTo("RouteProductList", {}, true)
            }
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
                MessageToast.show(this._oBundle.getText("textWarningForComment"))
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
        onCountryInput: function(oEvent) {
            const sSelectedCountry = oEvent.getParameter("selectedItem").getText()
            if (sSelectedCountry) {
                this._fetchCapital(sSelectedCountry)
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
            oInput.setValueState(constants.ValueState.ERROR)
            
            if (sInputName && sInputValue.length === 0) {
                const sMessage = this._oBundle.getText("suppliersValidationMessage", [sInputName])
                this._createMessage(sInputName, sMessage, oModel)
                return false
            }else {
                this._removeMessage(sInputName)
                oInput.setValueState(constants.ValueState.NONE)
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
         * Wait for the response and set new local model for countries suggestion.
         * @private
         * @returns {void} 
         */
        _fetchCountries: async function() {
            const aCountries = await productModel.getCountriesSuggestions()

            if (aCountries && aCountries.length > 0 ) {
                const oCountriesModel = new JSONModel({countries: [...aCountries]})
                this.setModel(oCountriesModel, "countriesModel")
            }
        },

        /**
         * Wait for the response and set Property of city.
         * @private
         * @param {string} sCountryName
         * @returns {void}
         */
        _fetchCapital: async function(sCountryName) {
            const sCapital = await productModel.getCitySuggestion(sCountryName)
            if (sCapital) {
                const oCapitalModel = new JSONModel({capital: [sCapital]})
                this.setModel(oCapitalModel, "capitalModel")
            }
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
         * Create id for new supplier.
         * @returns {string}
         */
        _generateSupplierID: function () {
            const oModel = this.getModel("productsModel")
            const aSupps = productModel.getAllSupplier(oModel).getData().suppliers
            
            return `sup_00${aSupps.length + 1}`
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
        }
    });
})