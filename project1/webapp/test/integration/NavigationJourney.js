/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"project1/test/integration/pages/ProductList"
], function (opaTest) {
	"use strict";

	QUnit.module("Navigation Journey");

	opaTest("Should see the initial page of the app", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp();

		// Assertions
      	Then.onTheViewPage.iShouldSeeThePageView();
		Then.onTheViewPage.iShouldSeeTheTableWithItems()
	});

	opaTest("Should see the table selections", function(Given, When, Then) {
		When.onTheViewPage.iSelectItems([0, 1, 2])

		Then.onTheViewPage.iShouldSeeSelectedItems(3)
		Then.onTheViewPage.iShouldSeeTheButtonEnabled()

		When.onTheViewPage.iDeselectItems()

		Then.onTheViewPage.iShouldSeeSelectedItems(0)
		Then.onTheViewPage.iShouldSeeTheButtonDisabled()
		
	});

	opaTest("Should see the Selected Items are deleted", function(Given, When, Then) {
		When.onTheViewPage.iSelectItems([2])
		Then.onTheViewPage.iShouldSeeTheButtonEnabled()
		
		When.onTheViewPage.iPressOnDeleteButton()
		Then.onTheViewPage.iShouldSeeTheButtonEnabled()
		// Then.onTheViewPage.iShouldSeeTheMessagePopover()
		// Then.onTheViewPage.iShouldSeeItemsAreDeleted([1])

		Then.iTeardownMyApp()
	})
});
