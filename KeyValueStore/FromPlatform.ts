import * as isoly from "isoly"
import * as platform from "../platform"
import { KeyValueStore } from "./KeyValueStore"

export class FromPlatform<V extends string | ArrayBuffer | ReadableStream = string | ArrayBuffer | ReadableStream>
	implements KeyValueStore<V>
{
	constructor(private readonly backend: platform.KeyValueStore) {}
	async set(
		key: string,
		value: V,
		options: { expires?: isoly.DateTime; meta?: Record<string, unknown> }
	): Promise<void> {
		await this.backend.put(
			key,
			value,
			Object.fromEntries(
				Object.entries({
					expirationTtl:
						options.expires != undefined
							? Math.max(60, isoly.DateTime.epoch(options.expires) - isoly.DateTime.epoch(isoly.DateTime.now()))
							: undefined, // Expiration did not work.
					metadata: options.meta,
				}).filter(([key, value]) => value)
			)
		)
	}
	async get(key: string): Promise<{ value: V; expires?: isoly.DateTime; meta: Record<string, unknown> } | undefined> {
		const data = await this.backend.getWithMetadata(key)
		return data.value != null
			? {
					value: data.value as V,
					expires: data.expiration != null ? isoly.DateTime.create(data.expiration) : undefined,
					meta: data.metadata ?? {},
			  }
			: undefined
	}
	async list(prefix: string): Promise<{
		data: {
			key: string
			value: V
			expires?: isoly.DateTime
			meta?: Record<string, unknown>
		}[]
		cursor?: string
	}> {
		const result = await this.backend.list({ prefix })
		return {
			data: result.keys.map<{
				key: string
				value: V
				expires?: isoly.DateTime
				meta?: Record<string, unknown>
			}>(item => ({
				key: item.name,
				value: item.value as V,
				expires: item.expiration ? isoly.DateTime.create(item.expiration) : undefined,
				meta: item.metadata,
			})),
			cursor: result.list_complete ? result.cursor : undefined,
		}
	}
}
