sap.ui.define([
    "sap/ui/core/Fragment"
], function (Fragment) {
    "use strict";

    return {
        onCommonPopup: function () {
            if (!this._oCreateDialog) {
                var oView = this.getView();
                Fragment.load({
                    id: oView.getId(),
                    name: "com.mdpert.sales.SalesOrderV1Module.view.CommonPopup",
                    controller: this
                }).then(function (oDialog) {
                    this._oCreateDialog = oDialog;
                    oView.addDependent(oDialog);
                    oDialog.open();
                }.bind(this));
            } else {
                this._oCreateDialog.open();
            }
            this._excelDialogRefresh();
        }

    };

});