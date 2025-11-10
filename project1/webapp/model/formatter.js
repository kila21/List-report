sap.ui.define([
    "project1/model/constants"
], function(
	constants
) {
	"use strict";

	return {
        /**
         * highlitght row depending on the discount date.
         * @param {string | undefined} sDiscountDate
         * @returns {string} valueState
         */
        highlightRow: function(sDiscountDate) {
            const oDiscountDate = new Date(sDiscountDate)
            const oCurrentDate = new Date()
            if (oDiscountDate > oCurrentDate) {
                return constants.ValueState.SUCCESS
            }
            return constants.ValueState.NONE
        }

	};
});