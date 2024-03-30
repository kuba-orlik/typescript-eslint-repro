import { Controller } from "stimulus";
// eslint-disable-next-line @typescript-eslint/no-explicit-any

declare global {
	interface Window {
		L: typeof import("leaflet");
	}
}

type Pin = {
	title: string;
	address: string;
	coordinates: string;
	button: { link: string; text: string };
};

function parseCoords(s: string): [number, number] {
	// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
	return s.split(", ").map((x) => parseFloat(x)) as [number, number];
}

export default class MapWithPins extends Controller {
	id: string;
	map: L.Map;
	initiated = false;
	resizeObserver: ResizeObserver;

	static values = {
		pins: String,
	};

	async connect() {
		if (this.initiated) {
			this.map.remove();
		}
		if (window.L) {
			this.initiateMap();
		} else {
			document.addEventListener(
				"loaded-https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
				() => {
					this.initiateMap();
				}
			);
		}
	}

	disconnect() {
		this.map.remove();
		this.initiated = false;
		this.resizeObserver.disconnect();
	}

	initiateMap() {
		// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
		this.map = window.L.map(this.element as HTMLElement);
		this.resizeObserver = new ResizeObserver(() => {
			this.map.invalidateSize();
		});

		this.resizeObserver.observe(this.element);

		// eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-call,  @typescript-eslint/no-unsafe-member-access
		window.L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
			maxZoom: 19,
			attribution:
				'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
		}).addTo(this.map);

		// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
		const pins = JSON.parse(
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,  @typescript-eslint/no-unsafe-argument
			this.element.attributes["data-map-with-pins-pins-value"].value
		) as Pin[];
		pins.forEach((pin) => this.addPin(pin));
		this.initiated = true;
	}

	async pinsValueChanged() {
		if (this.initiated) {
			await this.connect();
		}
	}

	addPin(pin: Pin) {
		const pinIcon = window.L.icon({
			iconUrl: "/pin-icon.svg",
			iconSize: [29, 41],
			iconAnchor: [14, 40],
			popupAnchor: [-3, 14],
		});

		// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
		window.L.marker(parseCoords(pin.coordinates), {
			icon: pinIcon,
		}).addTo(this.map);

		window.L.popup({
			closeButton: false,
			autoClose: false,
			closeOnEscapeKey: false,
			closeOnClick: false,
			className: "popup",
			offset: [0, -32],
		})
			// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
			.setLatLng(parseCoords(pin.coordinates))
			.setContent(
				/* HTML */ `<div class="popup-content">
					<p class="title">${pin.title}</p>
					<p class="address">${pin.address}</p>
					<a class="button" href="${pin.button.link}"> ${pin.button.text} </a>
				</div> `
			)
			.addTo(this.map);
		this.map.setView(parseCoords(pin.coordinates), 13);
	}
}
