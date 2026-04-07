export type RequiredNonNull<T> = { [P in keyof T]-?: NonNullable<T[P]> }
