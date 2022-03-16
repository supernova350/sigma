export default class Module {
	public readonly filepath: string;

	protected constructor(filepath: string) {
		if (new.target === Module) {
			throw new TypeError('Cannot construct Module instances directly.');
		}

		this.filepath = filepath;
	}
}
