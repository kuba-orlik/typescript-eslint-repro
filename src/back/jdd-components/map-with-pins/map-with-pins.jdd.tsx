import { FlatTemplatable, TempstreamJSX } from "tempstream";
import {
	Component,
	ComponentArguments,
	ExtractStructuredComponentArgumentsValues,
} from "@sealcode/jdd";

const coordinates = new ComponentArguments.ShortText();
coordinates.setExampleValues([
	"52.39706859245613, 16.898251247012197",
	"52.8, 16.6",
	"52.5, 16.1",
	"52.1, 16.35",
]);

const component_arguments = {
	pins: new ComponentArguments.List(
		new ComponentArguments.Structured({
			title: new ComponentArguments.ShortText(),
			address: new ComponentArguments.ShortText(),
			coordinates,
			button: new ComponentArguments.Structured({
				text: new ComponentArguments.ShortText(),
				link: new ComponentArguments.ShortText(),
			}),
		})
	),
} as const;

export class MapWithPins extends Component<typeof component_arguments> {
	getArguments() {
		return component_arguments;
	}

	async getEarlyAssets() {
		return [
			{
				type: "script" as const,
				url: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
				identity: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
				integrity: "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=",
			},
			{
				type: "style" as const,
				url: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
				integrity: "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=",
				identity: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
			},
		];
	}

	toHTML({
		pins,
	}: ExtractStructuredComponentArgumentsValues<
		typeof component_arguments
	>): FlatTemplatable {
		return (
			<div
				class="map-with-pins"
				data-controller="map-with-pins"
				data-map-with-pins-pins-value={JSON.stringify(pins)
					.replaceAll("\n", "\\n")
					.replaceAll('"', "&quot;")}
			></div>
		);
	}
}
