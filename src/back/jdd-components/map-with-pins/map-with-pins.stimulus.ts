import { Controller } from "stimulus";
declare const L: any;

export default class MapWithPins extends Controller {
	id: string;
	map: any;
	initiated: boolean = false;
	resizeObserver: ResizeObserver;

	static values = {
		pins: String,
	};

	connect() {
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
		this.map = L.map(this.element);
		this.resizeObserver = new ResizeObserver(() => {
			this.map.invalidateSize();
		});

		this.resizeObserver.observe(this.element);

		L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
			maxZoom: 19,
			attribution:
				'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
		}).addTo(this.map);

		const pins = JSON.parse(
			this.element.attributes["data-map-with-pins-pins-value"].value
		);
		pins.forEach((pin) => this.addPin(pin));
		this.initiated = true;
	}

	pinsValueChanged() {
		if (this.initiated) {
			this.connect();
		}
	}

	addPin(pin) {
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
		).addTo(this.map);

		var popup = L.popup({
			closeButton: false,
			autoClose: false,
			closeOnEscapeKey: false,
			closeOnClick: false,
			className: "popup",
			offset: [0, -32],
			maxWidth: "auto",
		})
			.setLatLng(pin.coordinates.split(", ").map((x) => parseFloat(x)))
			.setContent(
				/* HTML */ `<div class="popup-content">
					<p class="title">${pin.title}</p>
					<p class="address">${pin.address}</p>
					<a class="button" href="${pin.button.link}"> ${pin.button.text} </a>
				</div> `
			)
			.addTo(this.map);
		this.map.setView(
			pin.coordinates.split(", ").map((x) => parseFloat(x)),
			13
		);
	}
}
