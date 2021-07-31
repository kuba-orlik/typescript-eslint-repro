export default function frame(id: string, body: string): string {
	return /* HTML */ `<turbo-frame id="${id}"> ${body} </turbo-frame>`;
}
