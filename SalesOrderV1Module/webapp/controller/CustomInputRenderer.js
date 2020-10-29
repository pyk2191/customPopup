/*!
 * OpenUI5
 * (c) Copyright 2009-2020 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define(['sap/ui/core/InvisibleText', 'sap/ui/core/Renderer', 'sap/m/InputBaseRenderer', 'sap/m/library', 'sap/m/InputRenderer'],
	function(InvisibleText, Renderer, InputBaseRenderer, library, InputRenderer) {
	"use strict";


	// shortcut for sap.m.InputType
	var InputType = library.InputType;


	/**
	 * Input renderer.
	 *
	 * InputRenderer extends the InputBaseRenderer
	 *
	 * @namespace
	 */
	var CustomInputRenderer = Renderer.extend(InputRenderer);
	CustomInputRenderer.apiVersion = 2;

	return CustomInputRenderer;

}, /* bExport= */ true);
