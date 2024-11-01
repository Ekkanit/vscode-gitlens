import { AsyncComputed } from 'signal-utils/async-computed';

export const renderAsyncComputed = <T, R = unknown>(
	v: AsyncComputed<T>,
	{
		initial,
		pending,
		complete,
		error,
	}: {
		initial?: () => R;
		pending?: () => R;
		complete?: (value: T | undefined) => R;
		error?: (error: unknown) => R;
	},
) => {
	switch (v.status) {
		case 'initial':
			return initial?.();
		case 'pending':
			return pending?.();
		case 'complete':
			return complete?.(v.value);
		case 'error':
			return error?.(v.error);
	}
};

export class AsyncComputedState<T, R = unknown> {
	private _initial?: T;
	private _state?: AsyncComputed<T>;
	get state() {
		this._state ??= new AsyncComputed(this._fetch, this._initial ? { initialValue: this._initial } : undefined);
		return this._state;
	}

	constructor(
		private _fetch: (abortSignal: AbortSignal) => Promise<T>,
		options?: {
			autoRun?: boolean;
			initial?: T;
		},
	) {
		if (options != null) {
			this._initial = options.initial;
			if (options.autoRun === true) {
				this.run();
			}
		}
	}
	run() {
		this.state.run();
	}

	render(config: {
		initial?: () => R;
		pending?: () => R;
		complete?: (value: T | undefined) => R;
		error?: (error: unknown) => R;
	}) {
		return renderAsyncComputed(this.state, config);
	}
}