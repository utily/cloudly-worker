export interface KeyValueStore {
	get(
		key: string,
		type: "json" | "text" | "arrayBuffer" | "stream"
	): Promise<string | ReadableStream | ArrayBuffer | null>
	getWithMetadata(key: string): Promise<{
		value: string | ReadableStream | ArrayBuffer | null
		expiration?: number
		metadata?: Record<string, unknown>
	}>
	put(
		key: string,
		value: string | ReadableStream | ArrayBuffer,
		options?: {
			expiration?: number
			expirationTtl?: number
			metadata?: Record<string, unknown>
		}
	): Promise<void>
	delete(key: string): Promise<void>
	list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{
		keys: {
			name: string
			value: string | ReadableStream | ArrayBuffer
			expiration: number
			metadata: Record<string, unknown>
		}[]
		list_complete: boolean
		cursor: string
	}>
}
