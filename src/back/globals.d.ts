declare module "*.svg" {
	export const getContent: () => Promise<string>;
	export const getBuffer: () => Promise<Buffer>;
	export const getBase64: () => Promise<string>;
	export const url: string;
}

declare module "*.png" {
	export const getContent: () => Promise<string>;
	export const getBuffer: () => Promise<Buffer>;
	export const getBase64: () => Promise<string>;
	export const url: string;
}

declare module "*.jpg" {
	export const getContent: () => Promise<string>;
	export const getBuffer: () => Promise<Buffer>;
	export const getBase64: () => Promise<string>;
	export const url: string;
}

declare module "*.jpeg" {
	export const getContent: () => Promise<string>;
	export const getBuffer: () => Promise<Buffer>;
	export const getBase64: () => Promise<string>;
	export const url: string;
}

declare module "*.webp" {
	export const getContent: () => Promise<string>;
	export const getBuffer: () => Promise<Buffer>;
	export const getBase64: () => Promise<string>;
	export const url: string;
}
