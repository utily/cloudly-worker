import * as isoly from "isoly"

export interface KeyValueStore<V = unknown, M extends Record<string, unknown> = Record<string, unknown>> {
	set(key: string, value: V, options?: { expires?: isoly.DateTime; meta?: M }): Promise<void>
	get(key: string): Promise<{ value: V; expires?: isoly.DateTime; meta?: M } | undefined>
	list(
		prefix?: string
	): Promise<{ data: { key: string; value: V; expires?: isoly.DateTime; meta?: M }[]; cursor?: string }>
}
