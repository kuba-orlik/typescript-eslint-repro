export default function input({
	name,
	id,
	label,
	type,
	value,
	placeholder,
	error,
	readonly,
}: {
	name: string;
	id?: string;
	label?: string;
	type?: string;
	value?: string;
	placeholder?: string;
	readonly?: boolean;
	error: string;
}) {
	id = id || name;
	label = label || name;
	type = type || "text";
	value = value || "";
	placeholder = placeholder || type;
	readonly = readonly || false;
	return /* HTML */ `<div class="input">
		<label for="${id}">${label}</label>
		<input
			id="${id}"
			type="${type}"
			name="${name}"
			value="${value}"
			placeholder="${placeholder}"
			${readonly ? "readonly" : ""}
		/>
		${error ? `<div class="input__error">${error}</div>` : ""}
	</div>`;
}
