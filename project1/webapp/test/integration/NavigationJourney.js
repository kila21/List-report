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
		Then.onTheViewPage.iShouldSeeTheTableWithItems(10)
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
		When.onTheViewPage.iSelectItems([0, 1])
		Then.onTheViewPage.iShouldSeeTheButtonEnabled()
		
		When.onTheViewPage.iPressOnDeleteButton()
		Then.onTheViewPage.iShouldSeeTheMessagePopover()

		When.onTheViewPage.iPressOnConfirmDeletionButton()
		Then.onTheViewPage.iShouldSeeTheTableWithItems(8)

	}),
	
	opaTest("Should see the sorted Table", function(Given, When, Then) {
		// check ascending order
		When.onTheViewPage.iPressOnSortButton("name")

		Then.onTheViewPage.iShouldSeeTheTableWithItems(8)
		Then.onTheViewPage.iShouldSeeTheTableSortedBy("name", true)
		
		// check descending order
		When.onTheViewPage.iPressOnSortButton("name")
		Then.onTheViewPage.iShouldSeeTheTableSortedBy("name", false)

		When.onTheViewPage.iPressOnSortButton("name")
		Then.onTheViewPage.iShouldSeeTheTableSortedBy("name")
		
	});

	opaTest("Should see the filtered Table", function(Given, When, Then) {
		// only name filter
		When.onTheViewPage.iSearchForName('smar')
		When.onTheViewPage.iPressOnFilterBarSearch()

		Then.onTheViewPage.iShouldSeeTheTableFiltered('smar')
		Then.onTheViewPage.iShouldSeeTheTableWithItems(2)
		
		// add category filter
		When.onTheViewPage.iPressOnMultiComboBoxIcon()
		When.onTheViewPage.iSelectCategoryItems([4])
		When.onTheViewPage.iPressOnFilterBarSearch()
		Then.onTheViewPage.iShouldSeeTheTableFiltered('smar', ["Home Entertainment"])
		Then.onTheViewPage.iShouldSeeTheTableWithItems(1)
		
		// add date range filter
		const oDate = {
			sStart: "02/01/2024", 
			sEnd: "02/15/2025",
		}

		When.onTheViewPage.iSetDateRange("01 Feb 2024", "15 Feb 2025");
		When.onTheViewPage.iPressOnFilterBarSearch()
		Then.onTheViewPage.iShouldSeeTheTableFiltered('smar', ["Home Entertainment"], oDate)

		// add input(suggestion) filter.
		When.onTheViewPage.iSearchWithSuggestionInput("Visionary Displays")
		When.onTheViewPage.iPressOnFilterBarSearch()
		Then.onTheViewPage.iShouldSeeTheTableFiltered('smar', ["Home Entertainment"], oDate, "Visionary Displays")
		
		// clear
		When.onTheViewPage.iPressOnFilterClearButton()
		Then.onTheViewPage.iShouldSeeTheTableFiltered(null, null, null, null)
		
		Then.iTeardownMyApp()
	})

});
