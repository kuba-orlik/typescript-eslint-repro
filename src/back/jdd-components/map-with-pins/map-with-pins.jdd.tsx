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

	toHTML({
		pins,
	}: ExtractStructuredComponentArgumentsValues<
		typeof component_arguments
	>): FlatTemplatable {
		return (
			<div class="map-with-pins">
				<link
					rel="stylesheet"
					href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
					integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
					crossorigin=""
				/>
				<script
					onload="loadMap()"
					src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
					integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
					crossorigin=""
				></script>
				{
					/* HTML */ `<script>
						function loadMap() {
							const mapDiv = document.getElementById("map");
							const resizeObserver = new ResizeObserver(() => {
								map.invalidateSize();
							});

							resizeObserver.observe(mapDiv);
							var map = L.map("map");
							L.tileLayer(
								"https://tile.openstreetmap.org/{z}/{x}/{y}.png",
								{
									maxZoom: 19,
									attribution:
										'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
								}
							).addTo(map);

							const pins = ${JSON.stringify(pins)};
							pins.forEach((pin) => addPin(pin, map));
						}

						function addPin(pin, map) {
							var pinIcon = L.icon({
								iconUrl: "/pin-icon.svg",
								iconSize: [29, 41],
								iconAnchor: [14, 40],
								popupAnchor: [-3, 14],
							});

							var marker = L.marker(
								pin.coordinates.split(", ").map((x) => parseFloat(x)),
								{
									icon: pinIcon,
								}
							).addTo(map);

							var popup = L.popup({
								closeButton: false,
								autoClose: false,
								closeOnEscapeKey: false,
								closeOnClick: false,
								className: "popup",
								offset: [0, -32],
								maxWidth: "auto",
							})
								.setLatLng(
									pin.coordinates.split(", ").map((x) => parseFloat(x))
								)
								.setContent(
									/* HTML */ \`<div class="popup-content">
										<p class="title">\${pin.title}</p>
										<p class="address">\${pin.address}</p>
										<a class="button" href="\${pin.button.link}">
											\${pin.button.text}
										</a>
									</div> \`
								)
								.addTo(map);
							map.setView(
								pin.coordinates.split(", ").map((x) => parseFloat(x)),
								13
							);
						}
					</script>`
				}

				<div id="map"></div>
			</div>
		);
	}
}
