// DO NOT EDIT! This file is generated automaticaly with 'npm run generate-stimulus'

import * as Turbo from "@hotwired/turbo";
import { Application } from "stimulus";
const application = Application.start();

import { default as RefreshOnTsChanges } from "./../back/html-controllers/refresh-on-ts-changes.stimulus.js";
application.register("refresh-on-ts-changes", RefreshOnTsChanges);

import { default as RefreshStyles } from "./../back/html-controllers/refresh-styles.stimulus.js";
application.register("refresh-styles", RefreshStyles);

import { default as MapWithPins } from "./../back/jdd-components/map-with-pins/map-with-pins.stimulus.js";
application.register("map-with-pins", MapWithPins);

import { default as ComponentDebugger } from "./../back/routes/component-preview/component-debugger.stimulus.js";
application.register("component-debugger", ComponentDebugger);

import { default as InputImagePreview } from "./../back/routes/component-preview/input-image-preview.stimulus.js";
application.register("input-image-preview", InputImagePreview);

export { Turbo };
