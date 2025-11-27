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
         * Create model for Validations.
         * @private
         * @param {sap.ui.base.Event} oEvent
         */
        _onRouteMatched: function(oEvent) {
            this._fetchCountries()

            this._sID = oEvent.getParameter("arguments").productID
            const oModel = this.getModel("productsModel")

            let aProducts = []

            if(oModel) {
                aProducts = oModel.getProperty("/products")
                const sPath = aProducts.findIndex(oItem => oItem.id === this._sID)
                this.getView().bindElement({
                    path: '/products/' + sPath,
                    model: "productsModel"
                })
            }

			const aCurrentSuppliers = aProducts.filter(oItem => oItem.id === this._sID)[0].suppliers

            const oEditModeModel = new JSONModel({editable: false})
            this.setModel(oEditModeModel, "viewStateModel")

            const oSuppliersModel = new JSONModel({suppliers: [...aCurrentSuppliers]})
			this.setModel(oSuppliersModel, "suppliersModel")

            Messaging.removeAllMessages()

            const oView = this.getView()
            this.setModel(Messaging.getMessageModel(), "message");
            Messaging.registerObject(oView, true)
        },

        
        /**
         * Create Empty object and Update suppliersModel
         * @returns {void}
         */
		onSuppliersCreateButtonPress: function() {
			const aSuppliers = this.getModel("suppliersModel").getData().suppliers

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
			this.getModel("suppliersModel").setProperty("/suppliers", aSuppliers)
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
            else MessageToast.show("You are Already in Edit Mode. Save Changes Or Click Cancel.")
        },

        /**
         * Validate new Supplier.
         * saves the changes to the local model.
         * Saves the changes to the Main model And set view to Read-Only Mode.
         * @returns {void}
         */
        onSaveButtonPress: function() {
            let bValid = false
            const aSuppliersID = this._getSuppliersInput()

            const aValids = aSuppliersID.filter(oInput => !this._onSuppliersInputValidation(oInput))
            
            if (aValids.length === 0) {
                bValid = true
            }

            if (!bValid) {
                MessageToast.show("Fix Errors.")
                return 
            }

            const oModel = this.getModel("productsModel")
            const sPath = this.getView().getBindingContext("productsModel").getPath()
            const oSuppliers = this.getModel("suppliersModel")

            const oData = oModel.getProperty(sPath)
            const aSuppliers = oSuppliers.getProperty("/suppliers")
            
            const aUpdatedSuppliers = aSuppliers.map(oSup => {
                delete oSup.saveNew
                return oSup
            })

            oData.suppliers = aUpdatedSuppliers
            
            oSuppliers.setProperty("/suppliers", aUpdatedSuppliers)
            oModel.setProperty(sPath, oData)
            this.getModel("viewStateModel").setProperty("/editable", false)

            MessageToast.show("Product Details Saved Successfully.")
        },

        /**
         * Cancel all current changes And Switch view to Read-Only Mode.
         * @returns {void}
         */
        onCancelButtonPress: function() {
            const oSuppliersModel = this.getModel("suppliersModel")
            const oProductsModel = this.getModel("productsModel")

            const aProductsData = oProductsModel.getProperty("/products")
            const aOriginalSuppliers = aProductsData.filter(oItem => oItem.id === this._sID)[0].suppliers

            if (aOriginalSuppliers) {
                oSuppliersModel.setProperty("/suppliers", [...aOriginalSuppliers])
            }

            Messaging.removeAllMessages()
            this.getModel("viewStateModel").setProperty("/editable", false)
            MessageToast.show("All Current Changes are canceled.")
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
                this.navTo("RouteProductList")
            }
        },

        /**
         * Delete supplier on locally.Until Save button.
         * @param {sap.ui.base.Event} oEvent 
         */
        onSupplierDeleteButtonPress: function(oEvent) {
            const oPressedSupplier = oEvent.getSource().getBindingContext("suppliersModel").getObject()
            
            const oSuppliersModel = this.getModel("suppliersModel")
            const aSuppliersModel = oSuppliersModel.getProperty("/suppliers")
            
            const aUpdatedSuppliers = aSuppliersModel.filter(oItem => oItem.id !== oPressedSupplier.id)
            
            oSuppliersModel.setProperty("/suppliers", [...aUpdatedSuppliers])
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

            oInput.setValueState(constants.ValueState.ERROR)
            
            if (sInputName && sInputValue.length === 0) {
                const sMessage = `Suppliers: ${sInputName} is Required.`
                this._createMessage(sInputName, sMessage)
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
		 */
		_createMessage: function(sInputName, sMessage) {
			const oMessage = new Message({
				message: sMessage,
				type: MessageType.Error,
				target: `/${sInputName}`,
				processor: this.getModel("suppliersModel")
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
               this.getModel("suppliersModel").setProperty("/suppliers/0/city", sCapital)
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
         * Create id for new supplier.
         * @returns {string}
         */
        _generateSupplierID: function () {
            const oModel = this.getModel("productsModel")
            const aSupps = productModel.getAllSupplier(oModel).getData().suppliers
            
            return `sup_00${aSupps.length + 1}`
        },
    });
})