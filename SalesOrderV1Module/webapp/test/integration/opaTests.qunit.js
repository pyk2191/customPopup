/* global QUnit */

QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function() {
	"use strict";

	sap.ui.require([
		"com/mdpert/sales/SalesOrderV1Module/test/integration/AllJourneys"
	], function() {
		QUnit.start();
	});
});