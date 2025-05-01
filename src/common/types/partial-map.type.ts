export type PartialMap<T> = {
  [K in keyof T]?: any
}
