import { isTracking, trackEffects, triggerEffects } from './effect'
import { TrackOpTypes, TriggerOpTypes } from './operations'
import { isArray, isObject, hasChanged } from '@vue/shared'
import { reactive, isProxy, toRaw, isReactive } from './reactive'
import { CollectionTypes } from './collectionHandlers'
import { createDep, Dep } from './dep'

declare const RefSymbol: unique symbol

export interface Ref<T = any> {
  value: T
  /**
   * Type differentiator only.
   * We need this to be in public d.ts but don't want it to show up in IDE
   * autocomplete, so we use a private Symbol instead.
   */
  [RefSymbol]: true
  /**
   * @internal
   */
  _shallow?: boolean
}

type RefBase<T> = {
  dep?: Dep
  value: T
}

export function trackRefValue(ref: RefBase<any>) {
  if (isTracking()) {
    ref = toRaw(ref)
    if (!ref.dep) {
      ref.dep = createDep()
    }
    if (__DEV__) {
      trackEffects(ref.dep, {
        target: ref,
        type: TrackOpTypes.GET,
        key: 'value'
      })
    } else {
      trackEffects(ref.dep)
    }
  }
}

export function triggerRefValue(ref: RefBase<any>, newVal?: any) {
  ref = toRaw(ref)
  if (ref.dep) {
    if (__DEV__) {
      triggerEffects(ref.dep, {
        target: ref,
        type: TriggerOpTypes.SET,
        key: 'value',
        newValue: newVal
      })
    } else {
      triggerEffects(ref.dep)
    }
  }
}

const convert = <T extends unknown>(val: T): T =>
  isObject(val) ? reactive(val) : val

export function isRef<T>(r: Ref<T> | unknown): r is Ref<T>
export function isRef(r: any): r is Ref {
  return Boolean(r && r.__v_isRef === true)
}

export function ref<T extends object>(value: T): ToRef<T>
export function ref<T>(value: T): Ref<UnwrapRef<T>>
export function ref<T = any>(): Ref<T | undefined>
// 深层响应式
export function ref(value?: unknown) {
  return createRef(value, false)
}

export function shallowRef<T extends object>(
  value: T
): T extends Ref ? T : Ref<T>
export function shallowRef<T>(value: T): Ref<T>
export function shallowRef<T = any>(): Ref<T | undefined>
// 浅层响应式
export function shallowRef(value?: unknown) {
  return createRef(value, true)
}

class RefImpl<T> {
  // 存储响应式的值。我们追踪和更新的就是_value。（这个是重点）
  private _value: T
  // 用于存储原始值，即未经任何响应式处理的值。（用于对比的，这块的内容可以不看）
  private _rawValue: T

  // 用于依赖跟踪的 Dep 类实例
  public dep?: Dep = undefined
  // 一个标记，表示这是一个 ref 实例（isRef）
  public readonly __v_isRef = true

  constructor(value: T, public readonly _shallow: boolean) {
    // 如果是浅响应式，直接使用原始值，否则转换为非响应式原始值
    this._rawValue = _shallow ? value : toRaw(value)
    // 如果是浅响应式，直接使用原始值，否则用 reactive 转换为响应式值
    this._value = _shallow ? value : convert(value)

    // toRaw 用于将响应式引用转换回原始值
    // toReactive 函数用于将传入的值转换为响应式对象。对于基本数据类型，toReactive 直接返回原始值。
    // 对于对象和数组，toReactive 内部会调用 reactive 来创建一个响应式代理。
    // 因此，对于 ref 来说，基本数据类型的值会被 RefImpl 直接包装，而对象和数组
    // 会被 reactive 转换为响应式代理，最后也会被 RefImpl 包装。
    // 这样，无论是哪种类型的数据，ref 都可以提供响应式的 value 属性，
    // 使得数据变化可以被 Vue 正确追踪和更新。
    // export const toReactive = (value) => isObject(value) ? reactive(value) : value
  }

  get value() {
    // 追踪依赖，这样当 ref 的值发生变化时，依赖这个 ref 的组件或副作用函数可以重新运行。
    trackRefValue(this)
    // 返回存储的响应式值
    return this._value
  }

  set value(newVal) {
    // 如果需要，将新值转换为非响应式原始值
    newVal = this._shallow ? newVal : toRaw(newVal)
    // 如果新值与旧值不同，更新 _rawValue 和 _value
    if (hasChanged(newVal, this._rawValue)) {
      this._rawValue = newVal
      this._value = this._shallow ? newVal : convert(newVal)
      // 触发依赖更新
      triggerRefValue(this, newVal)
    }
  }
}

// shallow 浅层响应式
function createRef(rawValue: unknown, shallow: boolean) {
  if (isRef(rawValue)) {
    return rawValue
  }
  // 创建新的 RefImpl 实例
  return new RefImpl(rawValue, shallow)
}

export function triggerRef(ref: Ref) {
  triggerRefValue(ref, __DEV__ ? ref.value : void 0)
}

export function unref<T>(ref: T | Ref<T>): T {
  return isRef(ref) ? (ref.value as any) : ref
}

const shallowUnwrapHandlers: ProxyHandler<any> = {
  get: (target, key, receiver) => unref(Reflect.get(target, key, receiver)),
  set: (target, key, value, receiver) => {
    const oldValue = target[key]
    if (isRef(oldValue) && !isRef(value)) {
      oldValue.value = value
      return true
    } else {
      return Reflect.set(target, key, value, receiver)
    }
  }
}

export function proxyRefs<T extends object>(
  objectWithRefs: T
): ShallowUnwrapRef<T> {
  return isReactive(objectWithRefs)
    ? objectWithRefs
    : new Proxy(objectWithRefs, shallowUnwrapHandlers)
}

type CustomRefFactory<T> = (
  track: () => void,
  trigger: () => void
) => {
  get: () => T
  set: (value: T) => void
}

class CustomRefImpl<T> {
  public dep?: Dep = undefined

  private readonly _get: ReturnType<CustomRefFactory<T>>['get']
  private readonly _set: ReturnType<CustomRefFactory<T>>['set']

  public readonly __v_isRef = true

  constructor(factory: CustomRefFactory<T>) {
    const { get, set } = factory(
      () => trackRefValue(this),
      () => triggerRefValue(this)
    )
    this._get = get
    this._set = set
  }

  get value() {
    return this._get()
  }

  set value(newVal) {
    this._set(newVal)
  }
}

export function customRef<T>(factory: CustomRefFactory<T>): Ref<T> {
  return new CustomRefImpl(factory) as any
}

export type ToRefs<T = any> = {
  // #2687: somehow using ToRef<T[K]> here turns the resulting type into
  // a union of multiple Ref<*> types instead of a single Ref<* | *> type.
  [K in keyof T]: T[K] extends Ref ? T[K] : Ref<UnwrapRef<T[K]>>
}
export function toRefs<T extends object>(object: T): ToRefs<T> {
  if (__DEV__ && !isProxy(object)) {
    console.warn(`toRefs() expects a reactive object but received a plain one.`)
  }
  const ret: any = isArray(object) ? new Array(object.length) : {}
  for (const key in object) {
    ret[key] = toRef(object, key)
  }
  return ret
}

class ObjectRefImpl<T extends object, K extends keyof T> {
  public readonly __v_isRef = true

  constructor(private readonly _object: T, private readonly _key: K) {}

  get value() {
    return this._object[this._key]
  }

  set value(newVal) {
    this._object[this._key] = newVal
  }
}

export type ToRef<T> = [T] extends [Ref] ? T : Ref<UnwrapRef<T>>
export function toRef<T extends object, K extends keyof T>(
  object: T,
  key: K
): ToRef<T[K]> {
  const val = object[key]
  return isRef(val) ? val : (new ObjectRefImpl(object, key) as any)
}

// corner case when use narrows type
// Ex. type RelativePath = string & { __brand: unknown }
// RelativePath extends object -> true
type BaseTypes = string | number | boolean

/**
 * This is a special exported interface for other packages to declare
 * additional types that should bail out for ref unwrapping. For example
 * \@vue/runtime-dom can declare it like so in its d.ts:
 *
 * ``` ts
 * declare module '@vue/reactivity' {
 *   export interface RefUnwrapBailTypes {
 *     runtimeDOMBailTypes: Node | Window
 *   }
 * }
 * ```
 *
 * Note that api-extractor somehow refuses to include `declare module`
 * augmentations in its generated d.ts, so we have to manually append them
 * to the final generated d.ts in our build process.
 */
export interface RefUnwrapBailTypes {}

export type ShallowUnwrapRef<T> = {
  [K in keyof T]: T[K] extends Ref<infer V>
    ? V
    : // if `V` is `unknown` that means it does not extend `Ref` and is undefined
    T[K] extends Ref<infer V> | undefined
    ? unknown extends V
      ? undefined
      : V | undefined
    : T[K]
}

export type UnwrapRef<T> = T extends Ref<infer V>
  ? UnwrapRefSimple<V>
  : UnwrapRefSimple<T>

export type UnwrapRefSimple<T> = T extends
  | Function
  | CollectionTypes
  | BaseTypes
  | Ref
  | RefUnwrapBailTypes[keyof RefUnwrapBailTypes]
  ? T
  : T extends Array<any>
  ? { [K in keyof T]: UnwrapRefSimple<T[K]> }
  : T extends object
  ? {
      [P in keyof T]: P extends symbol ? T[P] : UnwrapRef<T[P]>
    }
  : T
