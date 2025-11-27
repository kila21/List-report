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
        },

        /**
         * If disount returns Success, otherwise Error (for state)
         * @param {string | undefined } sDiscountDate
         * @returns {string}
         */
        displaySaleWithState: function(sDiscountDate) {
            const oDiscountDate = new Date(sDiscountDate)
            const oCurrentDate = new Date()

            if (oDiscountDate > oCurrentDate) {
                return constants.ValueState.SUCCESS
            }
            return constants.ValueState.ERROR
        },

        /**
         * In case there is less then 7 days passed since release date displays infoLabel.
         * @param {string} sReleaseDate 
         * @returns {boolean}
         */
        displayLabelNew: function(sReleaseDate) {
            const oReleaseDate = new Date(sReleaseDate)
            const oCurrentDate = new Date()
            const iDiffMs = oCurrentDate - oReleaseDate;
            const iDiffDays = Math.floor(iDiffMs / (1000 * 60 * 60 * 24));

            if (iDiffDays > 7) {
                return false
            }
            return true
        },

        /**
         * Calculates total days from Release Date to today.
         * @param {string} sReleaseDate
         * @returns {string}
         */
        displayTotalDays: function(sReleaseDate) {
            const oReleaseDate = new Date(sReleaseDate)
            const oCurrentDate = new Date()

            const iDiffMs = oCurrentDate - oReleaseDate;
            const iDiffDays = Math.floor(iDiffMs / (1000 * 60 * 60 * 24));

            if (iDiffDays === 0) {
                return 'First Day'
            }
            return iDiffDays + ' Days'
        },

        /**
         * Enables Control Depending on value.(for input inside suppliers)
         * @param {boolean} value 
         * @returns {boolean}
         */
        enableControl : function(value) {
			return !!value;
		},

        /**
         * Disables Control Depending on value.(for input inside suppliers)
         * @param {boolean} value 
         * @returns {boolean}
         */
		disableControl : function(value) {
			return !value;
		},
	};
});