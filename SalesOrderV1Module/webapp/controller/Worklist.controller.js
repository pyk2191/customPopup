sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "../model/xlsx",
    "../model/jszip",
	"sap/m/Dialog",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/m/Button",
	"sap/m/ButtonType",

], function (BaseController, JSONModel, History, formatter, Filter, FilterOperator, MessageToast, MessageBox, Fragment, xlsx, jszip, Dialog, List, StandardListItem, Button, ButtonType) {
	"use strict";

	return BaseController.extend("com.mdpert.sales.SalesOrderV1Module.controller.Worklist", {

        formatter   : formatter,
        xlsx        : xlsx,
        jszip       : jszip,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit : function () {
			var oViewModel;

			// keeps the search state
			this._aTableSearchState = [];

			// Model used to manipulate control states
			oViewModel = new JSONModel({
				worklistTableTitle : this.getResourceBundle().getText("worklistTableTitle"),
				saveAsTileTitle: this.getResourceBundle().getText("saveAsTileTitle", this.getResourceBundle().getText("worklistViewTitle")),
				shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
				shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
				shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
				tableNoDataText : this.getResourceBundle().getText("tableNoDataText")
			});
			this.setModel(oViewModel, "worklistView");

			// Add the worklist page to the flp routing history
			this.addHistoryEntry({
				title: this.getResourceBundle().getText("worklistViewTitle"),
				icon: "sap-icon://table-view",
				intent: "#SalesOrderPyk-display"
            }, true);
            
            this.setModel(oViewModel, "worklistView");

            this._excelDialogRefresh();
        },

		onDefaultDialogPress: function () {
			if (!this.oDefaultDialog) {
				this.oDefaultDialog = new Dialog({
					title: "Available Products",
					content: new List({
						items: {
							path: "/Header",
							template: new StandardListItem({
								title: "{salesNo}"
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
				this.getView().addDependent(this.oDefaultDialog);
			}

			this.oDefaultDialog.open();
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Triggered by the table's 'updateFinished' event: after new table
		 * data is available, this handler method updates the table counter.
		 * This should only happen if the update was successful, which is
		 * why this handler is attached to 'updateFinished' and not to the
		 * table's list binding's 'dataReceived' method.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onUpdateFinished : function (oEvent) {
			// update the worklist's object counter after the table update
			var sTitle,
				oTable = oEvent.getSource(),
				iTotalItems = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
			} else {
				sTitle = this.getResourceBundle().getText("worklistTableTitle");
			}
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
		},

		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPress : function (oEvent) {
			// The source is the list item that got pressed
			this._showObject(oEvent.getSource());
        },
        
		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */
		onShareInJamPress : function () {
			var oViewModel = this.getModel("worklistView"),
				oShareDialog = sap.ui.getCore().createComponent({
					name: "sap.collaboration.components.fiori.sharing.dialog",
					settings: {
						object:{
							id: location.href,
							share: oViewModel.getProperty("/shareOnJamTitle")
						}
					}
				});
			oShareDialog.open();
		},

		onSearch : function (oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.onRefresh();
			} else {
				var aTableSearchState = [];
				var sQuery = oEvent.getParameter("query");

				if (sQuery && sQuery.length > 0) {
					aTableSearchState = [new Filter("salesNo", FilterOperator.Contains, sQuery)];
				}
				this._applySearch(aTableSearchState);
			}

		},

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh : function () {
			var oTable = this.byId("table");
			oTable.getBinding("items").refresh();
		},

        onOpenExcelPopup: function () {
            if(!this._oCreateDialog){
                var oView = this.getView();
                Fragment.load({
                    id: oView.getId(),
                    name: "com.mdpert.sales.SalesOrderV1Module.view.ExcelUpload",
                    controller: this
                }).then(function (oDialog) {
                    this._oCreateDialog = oDialog;
                    oView.addDependent(oDialog);
                    oDialog.open();
                }.bind(this));
            }else{
                this._oCreateDialog.open();
            }
            this._excelDialogRefresh();
        },

        onDialogCancel: function(){
            this.byId('excelUpload').close();
        },

        onUpload: function (e) {
            this._import(e.getParameter("files") && e.getParameter("files")[0]);
        },

        _import: function (file) {
            var that = this;
            var excelData = {};
            if (file && window.FileReader) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    var data = e.target.result;
                    var workbook = XLSX.read(data, {
                        type: 'binary'
                    });
                    workbook.SheetNames.forEach(function (sheetName) {
                        // Here is your object for every sheet in workbook
                        excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                    });
                    // Setting the data to the local model 
                    that.localModel.setData({
                        items: excelData
                    });
                    that.localModel.refresh(true);
                };
                reader.onerror = function (ex) {
                    console.log(ex);
                };
                reader.readAsBinaryString(file);
            }
        },

        _excelDialogRefresh : function(){
            this.localModel = new sap.ui.model.json.JSONModel();
            this.getView().setModel(this.localModel, "localModel");
        },

        onDialogSave: function(){
            var excelOdata = this.getView().getModel("localModel").oData.items,
                headerData = {salesNo: "4", custName: "D고객"},
                itemData = [],
                oNewContext,
                oTable = this.byId("table"),
                oBinding = oTable.getBinding("items"),
                oData;

            for(var i=0; i < excelOdata.length ;i++){
                var itemRowData ={
                    itemCode:excelOdata[i].itemCode,
                    itemName:excelOdata[i].itemCode,
                    cnt:parseInt(excelOdata[i].cnt),
                    price:parseFloat(excelOdata[i].price).toFixed(2)
                };
                itemData.push(itemRowData);

                oData = jQuery.extend(headerData, {items: itemData});
            };
            
            oNewContext = oBinding.create(oData);
            oNewContext.created().then(function () {
                excelOdata.setProperty("/busy", false);
                MessageToast.show("Success.");
            }).catch(function () {
                excelOdata.setProperty("/busy", false);
                MessageBox.alert("Sorry. It's failed.");
            });
        },
        
		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showObject : function (oItem) {
			var that = this;

			oItem.getBindingContext().requestCanonicalPath().then(function (sObjectPath) {
				that.getRouter().navTo("object", {
					objectId_Old: oItem.getBindingContext().getProperty("ID"),
					objectId : sObjectPath.slice("/Header".length) // /Products(3)->(3)
				});
			});
		},

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
		 * @private
		 */
		_applySearch: function(aTableSearchState) {
			var oTable = this.byId("table"),
				oViewModel = this.getModel("worklistView");
			oTable.getBinding("items").filter(aTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
		}

	});
});