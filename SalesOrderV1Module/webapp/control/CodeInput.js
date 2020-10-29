sap.ui.define([
    "sap/m/Input",
    "./CodeDialog"
], function (Input, CodeDialog) {
    "use strict";

    var CodeInput = Input.extend("com.mdpert.sales.SalesOrderV1Module.control.CodeInput", {
        metadata: {
            properties: {
                showValueHelp: { type: "boolean", group: "Behavior", defaultValue: true },
                valueHelpRequest: {
                    parameters: {
                        fromSuggestions: { type: "boolean", defaultValue: true }
                    }
                }
            }
        },

        init: function () {
            Input.prototype.init.call(this);
            this.attachValueHelpRequest(this.handleValueHelpRequest);
        },

        handleValueHelpRequest: function (oEvent) {
            var codeDialog = new CodeDialog;
            codeDialog.open();
        }
    });

    return CodeInput;

});