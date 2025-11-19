sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/AggregationLengthEquals",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/actions/Press"
], function (
	Opa5,
	AggregationLengthEquals,
	Properties,
	PropertyStrictEquals,
	Press
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
				}
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

				iShouldSeeTheTableWithItems: function () {
					return this.waitFor({
						id: sTableID,
						viewName: sViewName,
						matchers: new AggregationLengthEquals({name: "items", length: 10}),
						success: function(oTable) {
							Opa5.assert.ok(oTable.getItems().length === 10, "The table at init have 10 item.")
						},
						errorMessage: "The Table at init have not 10 item"
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
						success: function (oMessage) {
							console.log(oMessage)
							Opa5.assert.ok(true, "Message Popover is displayed")
						},
						errorMessage: "Cannot find the messagePopover."
					})
				},

				// iShouldSeeItemsAreDeleted: function(aIndex) {
				// 	return this.waitFor({
				// 		id: sTableID,
				// 		viewName: sViewName,
				// 		success: function (oTable) {
				// 			const oItem = oTable.getItems()[1]
				// 			oTable.removeItem(oItem)
				// 			console.log('Deleted: ' + oDeleted)
				// 			Opa5.assert.ok(true, "item removed: " + oTable.getItems().length)
				// 		},
				// 		errorMessage: "Cant remove the item"
				// 	})
				// }
			}
		}
	});

});
