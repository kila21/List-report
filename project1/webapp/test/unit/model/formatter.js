/*global QUnit */

sap.ui.define([
	"project1/model/formatter",
    "project1/model/constants"
], function(
	formatter,
    constants
) {
	"use strict";

	QUnit.module("formatter--highlightRow")

    QUnit.test("Shouldn't highlight the Row", function(assert) {
        const sDiscountDate = "2024-11-15"
        const sReturnedValue = formatter.highlightRow(sDiscountDate)

        assert.strictEqual(sReturnedValue, constants.VALUESTATE.NONE, "Correct State returned (None).")
    });

    QUnit.test("Should Highlight the Row", function(assert) {
        const sDiscountDate = "2026-11-17"
        const sReturnedValue = formatter.highlightRow(sDiscountDate)

        assert.strictEqual(sReturnedValue, constants.VALUESTATE.SUCCESS, "Correct State returned (Success).")
    });
});