/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
    "project1/test/unit/AllTests"
], function () {
    "use strict";

    QUnit.start();
});