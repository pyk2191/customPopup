sap.ui.define([
    "sap/m/Input",
	"./CustomInputRenderer",
	"sap/ui/core/Fragment",
	"sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
	"sap/m/SelectDialog",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/m/Button",
    "sap/m/ButtonType",
	"sap/ui/model/json/JSONModel"
],function( Input, CustomInputRenderer, Fragment, Filter, FilterOperator, SelectDialog, List, StandardListItem, Button, ButtonType, JSONModel ) {
	"use strict";
    var CustomInput = Input.extend("com.mdpert.sales.SalesOrderV1Module.controller.CustomInput", /** @lends sap.m.Input.prototype */ 
    { 
    metadata : {
		library : "sap.m",
		properties : {
            showValueHelp : {type : "boolean", group : "Behavior", defaultValue : true},

			valueHelpRequest : {
				parameters : {
					fromSuggestions : {type : "boolean"}
				}
			}
        },
    }});

    /**
     * Fire valueHelpRequest event.
     *
     * @private
     */
    
    CustomInput.prototype._fireValueHelpRequest = function() {
        if (!this.oDefaultDialog) {
				this.oDefaultDialog = new SelectDialog({
					title: "CustomPopup",
					content: new List({
						items: {
							path: "/Header",
							template: new StandardListItem({
								title: "{salesNo}",
								counter: "{custName}"
							})
						}
					}),
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "OK",
						press: function () {
							this.oDefaultDialog.close();
						}.bind(this)
					}),
					endButton: new Button({
						text: "Close",
						press: function () {
							this.oDefaultDialog.close();
						}.bind(this)
					})
				});

				// to get access to the controller's model
				//this.getView().addDependent(this.getParent.oDefaultDialog);
			}

			this.oDefaultDialog.open();
    };

    return CustomInput;
    
});