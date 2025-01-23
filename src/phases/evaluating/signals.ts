type Fn = () => void

export type Getter<T> = () => T
export type Setter<T> = (newValue: T) => void

export let currentFunction: null | Fn

export function createSignal<T>(initialValue: T) {
  let value = initialValue
  let functions = new Set<Fn>()

  function read() {
    if (currentFunction) functions.add(currentFunction)
    return value
  }

  function write(newValue: T) {
    value = newValue
    for (const fn of functions) fn()
  }

  return [read, write] as [Getter<T>, Setter<T>]
}

export function createEffect(fn: Fn) {
  currentFunction = fn
  fn()
  currentFunction = null
}
