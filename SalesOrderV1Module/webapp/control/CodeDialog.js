sap.ui.define([
    "sap/m/Dialog",
    "sap/m/List",
    "sap/m/Text",
    "sap/m/StandardListItem",
    "sap/ui/model/json/JSONModel"
], function (Dialog, List, Text, StandardListItem, JSONModel) {
    "use strict";


    var CodeDialog = Dialog.extend("com.mdpert.sales.SalesOrderV1Module.control.CodeDialog", {
        metadata: {
            properties: {
                /**
                 * Title text appears in the Dialog header.
                 */
                title: { type: "string", group: "Appearance", defaultValue: "Code" }
            }
        },


        init: function () {
            Dialog.prototype.init.call(this);
            
			var oModel = new JSONModel('../sales-arthur-dest/odata/v4/SalesServicePyk/Header');
            this.setModel(oModel);

            // oModel.attachRequestCompleted(function(){
            // }.bind(this));

            // this.addContent(new Text({
            //     text: '{/value/0/custName}'
            // }));
            
            this.addContent(new List({
                items: {
                    path: "/value",
                    template: new StandardListItem({
                        title: "{salesNo}"
                    })
                }
            }));
        }

    });


    return CodeDialog;
}, /* bExport= */ true);
