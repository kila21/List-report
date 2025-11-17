sap.ui.define([
	"sap/ui/test/Opa5",
	"project1/test/integration/arrangements/Startup",
	"project1/test/integration/NavigationJourney"
], function (Opa5, Startup) {
	"use strict";

	Opa5.extendConfig({
		arrangements: new Startup(),
		viewNamespace: "project1.view.",
		autoWait: true
	});
});
