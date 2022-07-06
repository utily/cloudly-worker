import * as isoly from "isoly"
import { KeyValueStore } from "./KeyValueStore"

export type Item<V> = {
	value: V
	expires?: isoly.DateTime
	meta?: Record<string, unknown>
}

export class InMemory<V extends string | ArrayBuffer | ReadableStream = string | ArrayBuffer | ReadableStream>
	implements KeyValueStore<V>
{
	private readonly data: Record<string, Item<V>> = {}
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	private constructor() {}
	async set(
		key: string,
		value: V,
		options: { expires?: isoly.DateTime; meta?: Record<string, unknown> }
	): Promise<void> {
		this.data[key] = { value, ...options }
	}
	async get(key: string): Promise<Item<V> | undefined> {
		const data = this.data[key]
		return data != undefined && (!data.expires || data.expires >= isoly.DateTime.now()) ? data : undefined
	}
	async list(prefix: string): Promise<{
		data: ({
			key: string
		} & Item<V>)[]
		cursor?: string
	}> {
		const now = isoly.DateTime.now()
		return {
			data: Object.entries(this.data)
				.filter(([key, value]) => (!prefix || key.startsWith(prefix)) && (!value.expires || value.expires >= now))
				.map(([key, value]) => ({ key, ...value })),
		}
	}
	private static opened: Record<string, InMemory> = {}
	static open<V extends string | ArrayBuffer | ReadableStream = string | ArrayBuffer | ReadableStream>(
		namespace?: string
	): InMemory<V> {
		return namespace
			? (this.opened[namespace] as InMemory<V>) ?? (this.opened[namespace] = this.open())
			: new InMemory<V>()
	}
	static exists(namespace?: string): boolean {
		return !!(namespace && this.opened[namespace])
	}
}
