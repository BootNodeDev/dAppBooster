/** Error for structural/developer mistakes that cannot be fixed by retrying at runtime. */
export class DeveloperError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DeveloperError'
  }
}
