import glob from 'glob-promise';
import path, { extname } from 'path';

export default class Store<ItemType> {
	protected readonly store: Map<string, ItemType>;

	protected constructor() {
		if (new.target === Store) {
			throw new TypeError('Cannot construct Store instances directly.');
		}

		this.store = new Map();
	}

	protected async readFilesIn(dirpath: string, exts?: string[]): Promise<string[]> {
		const filepaths = await glob(path.join(__dirname, dirpath));
		return filepaths.filter(file => exts?.includes(extname(file)));
	}

	//Write a method to filter a this.store by a predicate function and return a new map with the filtered items.
	public filter(predicate: (item: ItemType) => boolean): Map<string, ItemType> {
		const filtered = new Map();
		for (const [key, value] of this.store) {
			if (predicate(value)) {
				filtered.set(key, value);
			}
		}
		return filtered;
	}

	//Write a method to find a value in this.store by a predicate function and return the value.
	public find(predicate: (item: ItemType) => boolean): ItemType | undefined {
		for (const [key, value] of this.store) {
			if (predicate(value)) {
				return value;
			}
		}
		return undefined;
	}
}
