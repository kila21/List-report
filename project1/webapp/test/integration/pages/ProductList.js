sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/AggregationLengthEquals",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/matchers/AggregationContainsPropertyEqual",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/EnterText"
], function (
	Opa5,
	AggregationLengthEquals,
	Properties,
	PropertyStrictEquals,
	AggregationContainsPropertyEqual,
	Press,
	EnterText
) {
	"use strict";

	const sViewName = "ProductList"
	const sViewID = "idProductListPage"
	const sTableID = "idProductsTable"
	const sDeleteButtonID = "idDeleteButton"
	
	Opa5.createPageObjects({
		onTheViewPage: {
			actions: {
				iSelectItems: function(aIndex) {
					return this.waitFor({
						id: sTableID,
						viewName: sViewName, 
						success: function (oTable) {
							const aPromises = aIndex.map(function (iIndex) {
								return this.waitFor({
									controlType: "sap.m.CheckBox",
									matchers: [
										function (oCheckBox) {
											const oItem = oCheckBox.getParent()
											return oItem && oTable.getItems().indexOf(oItem) === iIndex
										}
									],
									actions: new Press(),
									errorMessage: "Could not press checkbox in row: " + iIndex
								})
							}.bind(this))

							return Promise.all(aPromises)
						}.bind(this),
						errorMessage: "The products table was not available to select an item."
					});
				},

				iDeselectItems: function() {
					return this.waitFor({
						id: sTableID,
						viewName: sViewName,
						success: function (oTable) {
							const aSelectedItems = oTable.getSelectedItems()
							const aPromises = aSelectedItems.map(function (oSelectedItem) {
								return this.waitFor({
									controlType: "sap.m.CheckBox",
									actions: new Press(),
									errorMessage: "Cannot deselect items"
								})
							}.bind(this))

							return Promise.all(aPromises)
						}.bind(this),
						errorMessage: "Cant Remove The Selections."
					})
				},

				iPressOnDeleteButton: function() {
					return this.waitFor({
						id: sDeleteButtonID,
						viewName: sViewName,
						actions: new Press(),
						errorMessage: "Cant click on the Delete Button"
					})
				},

				iPressOnConfirmDeletionButton: function() {
					return this.waitFor({
						controlType: "sap.m.Link",
						viewName: sViewName,
						matchers: new Properties({emphasized: true}),
						actions: new Press(),
						errorMessage: "Could not find the Link control."
					})
				},

				iPressOnSortButton: function(sSortProperty) {
					return this.waitFor({
						controlType: "sap.m.Button",
						viewName: sViewName,
						matchers: new AggregationContainsPropertyEqual({
							aggregationName: "customData",
							propertyName: "value",
                			propertyValue: sSortProperty
						}),
						actions: new Press(),
						errorMessage: "Could not find the Sort button."
					})
				},

				iSearchForName: function(sSearchString) {
					return this.waitFor({
						controlType: "sap.m.SearchField",
						viewName: sViewName,
						actions: new EnterText({
							text: sSearchString
						}),
						errorMessage: "SearchField was not found."
					})
				},

				iPressOnMultiComboBoxIcon: function () {
					return this.waitFor({
						controlType: "sap.ui.core.Icon",
						viewName: sViewName,
						matchers: [
							new PropertyStrictEquals({
								name: "src",
								value: "sap-icon://slim-arrow-down"
							})
						],
						actions: new Press(),
						errorMessage: "Could not find MultiComboBox Icon."
					})
				},
				
				iSelectCategoryItems: function (aIndex) {
					return this.waitFor({
						controlType: "sap.m.List",
						success: function (aLists) {
							const oList = aLists[0];
							const aItems = oList.getItems();

							aIndex.forEach(function (iIndex) {
								new Press().executeOn(aItems[iIndex]);
							});
							Opa5.assert.ok(true, "Categories Selected Successfuly");
						},
						errorMessage: "Dropdown list not found"
					});
				},

				iSetDateRange: function (sFrom, sTo) {
					const sValue = `${sFrom} - ${sTo}`
					return this.waitFor({
						controlType: "sap.m.DateRangeSelection",
						viewName: sViewName,
						actions: new EnterText({ text: sValue }),
						success: function () {
							Opa5.assert.ok(true, "Date range set via text input.");
						},
						errorMessage: "DateRangeSelection not found."
					});
				},

				iSearchWithSuggestionInput: function (sText) {
					return this.waitFor({
						controlType: "sap.m.Input",
						viewName: sViewName,
						actions: new EnterText({ text: sText }),
						success: function () {
							Opa5.assert.ok(true, "Text entered into suggestion input.");
						},
						errorMessage: "Suggestion input not found."
					});
				},

				iPressOnFilterBarSearch: function () {
					return this.waitFor({
						controlType: "sap.m.Button",
						viewName: sViewName,
						matchers: [
							new Properties({text: 'Go'}),
							new Properties({type: 'Emphasized'})
						],
						actions: new Press(),
						errorMessage: "Could not find FilterBar Search button"
					});
				},

				iPressOnFilterClearButton: function () {
					return this.waitFor({
						controlType: "sap.m.Button",
						viewName: sViewName,
						matchers: [
							new Properties({text: 'Clear'}),
							new Properties({type: 'Transparent'})
						],
						actions: new Press(),
						errorMessage: "Could not find FilterBar Clear button"
					});
				},

			},

			assertions: {
				iShouldSeeThePageView: function () {
					return this.waitFor({
						id: sViewID,
						viewName: sViewName,
						success: function () {
							Opa5.assert.ok(true, "The " + sViewName + " view is displayed");
						},
						errorMessage: "Did not find the " + sViewName + " view"
					});
				},

				iShouldSeeTheTableWithItems: function (iItems) {
					return this.waitFor({
						id: sTableID,
						viewName: sViewName,
						matchers: new AggregationLengthEquals({name: "items", length: iItems}),
						success: function(oTable) {
							const iTableLength = oTable.getItems().length
							Opa5.assert.ok(iTableLength === iItems, "The Table items length is: " + iTableLength)
						},
						errorMessage: "The Table items length is Less/More then: " + iItems
					})
				},

				iShouldSeeSelectedItems: function (iItemsLength) {
					return this.waitFor({
						id: sTableID,
						viewName: sViewName,
						success: function(oTable) {
							const aSel = oTable.getSelectedItems()
							Opa5.assert.ok(aSel.length === iItemsLength, "Selected items Length: " + iItemsLength)
						},
						errorMessage: "Items Are not selected or Length is incorrect."
					})
				},

				iShouldSeeTheButtonEnabled: function () {
					return this.waitFor({
						controlType: "sap.m.Button",
						viewName: sViewName,
						matchers: new Properties({type: "Reject"}),
						success: function(aButtons) {
							const oDelete = aButtons[0]
							Opa5.assert.ok(oDelete.getEnabled(), "Delete button is enabled: " + oDelete.getEnabled())
						},
						errorMessage: "Button is Disabled"
					})
				},

				iShouldSeeTheButtonDisabled: function () {
					return this.waitFor({
						id: sDeleteButtonID,
						viewName: sViewName,
						autoWait: false,
						matchers: new PropertyStrictEquals({name: "enabled", value: false}),
						success: function(oButton) {
							Opa5.assert.ok(!oButton.getEnabled(), "Delete button is enabled: " + oButton.getEnabled())
						},
						errorMessage: "Button is enabled"
					})
				},

				iShouldSeeTheMessagePopover: function () {
					return this.waitFor({
						id: "idConfirmationMessagePopover",
						viewName: sViewName,
						success: function () {
							Opa5.assert.ok(true, "Message Popover is displayed")
						},
						errorMessage: "Cannot find the messagePopover."
					})
				},

				iShouldSeeTheTableSortedBy: function(sSortProperty, bAscending=null) {
					return this.waitFor({
						id: sTableID,
						viewName: sViewName,
						success: function(oTable) {
							const aContexts = oTable.getBinding("items").getCurrentContexts()
							const aItems = aContexts.map(oItem => oItem.getProperty(sSortProperty))
							const aOriginal = oTable.getModel("productsModel")
							.getProperty("/products")
							.map(oItem => oItem[sSortProperty])
							
							if(typeof bAscending === 'boolean') {
								if(sSortProperty === 'price') {
									aOriginal.sort((a, b) => a - b)
								} else {
									aOriginal.sort((a, b) => a.localeCompare(b))
								}

								if (typeof bAscending === 'boolean' && !bAscending) {
									aOriginal.reverse()
								}
							}
							
							Opa5.assert.deepEqual(
								aItems,
								aOriginal,
								"Table sorted correctly."
							)
						},
						errorMessage: "Table sorted incorrectly."
					})
				},

				iShouldSeeTheTableFiltered: function(sName, aCategories, oDate, sSupplier) {
					return this.waitFor({
						id: sTableID,
						viewName: sViewName,
						success: function(oTable) {
							const aContexts = oTable.getBinding("items").getCurrentContexts()
							const aItems = aContexts.map(oItem => oItem.getObject())
							const aOriginal = oTable.getModel("productsModel").getProperty("/products")

							let aResult = aOriginal

							if (sName) {
								aResult = aResult.filter(oItem => oItem.name.toLowerCase().includes(sName))
							}

							if (aCategories && aCategories.length > 0) {
								aResult = aResult.filter(item =>
									item.categories.some(oCat =>
										aCategories.includes(oCat.name)
									)
								);
							}

							if (oDate) {
								const sStartDate = new Date(oDate.sStart)
								const sEndDate = new Date(oDate.sEnd)

								aResult = aResult.filter(oItem => {
									const date = new Date(oItem.releaseDate); 
									return date >= sStartDate && date <= sEndDate;
								});
							}

							if (sSupplier) {
								aResult = aResult.filter(oItem => {
									return oItem.suppliers.some(oSup => oSup.name === sSupplier)
								})
							}

							Opa5.assert.deepEqual(
								aItems, 
								aResult,
								"Table filtered correctly."
							)
						},
						errorMessage: "Table filter dont work."
					})
				}
			}
		}
	});

});
