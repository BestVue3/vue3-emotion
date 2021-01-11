// import { CSSInterpolation } from '@emotion/css'
import {
    serializeStyles,
    SerializedStyles,
    Interpolation,
    CSSInterpolation,
} from '@emotion/serialize'
import { insertStyles } from '@emotion/utils'
import createCache, { EmotionCache } from '@emotion/cache'
import { tags } from './styled/tags'

import {
    computed,
    ComputedRef,
    defineComponent,
    PropType,
    inject,
    provide,
    Ref,
    shallowRef,
    watchEffect,
} from 'vue'

import createStyled from './styled'

function invariant(cond: boolean, message: string): void {
    if (!cond) throw new Error(message)
}

interface StylesObject {
    [name: string]: CSSInterpolation
}

interface CreateEmotionOptions {
    themeInjectKey?: symbol | string
    cacheInjectKey?: symbol | string
}

export function createEmotion<Theme>(opts: CreateEmotionOptions = {}) {
    const themeKey =
        opts.themeInjectKey || Symbol('emotion-vue-inject-theme-key')
    const cacheKey =
        opts.cacheInjectKey || Symbol('emotion-vue-inject-cache-key')

    const defaultThemeRef = shallowRef({} as Theme)
    const defaultCache = createCache({
        key: 'css',
    })
    const defaultCacheRef = shallowRef(defaultCache)
    let cache: EmotionCache = defaultCache

    const ThemeProvider = defineComponent({
        name: 'EmotionVueThemeProvider',
        props: {
            theme: {
                type: Object as PropType<Theme>,
                required: true,
            },
            cache: {
                type: Object as PropType<EmotionCache>,
            },
        },
        setup(props, { slots }) {
            const theme = computed(() => props.theme)

            provide(themeKey, theme)
            provide(
                cacheKey,
                computed(() => props.cache || defaultCache),
            )

            watchEffect(() => {
                if (props.cache) cache = props.cache
            })

            return () => slots.default && slots.default()
        },
    })

    const CacheProvider = defineComponent({
        name: 'EmotionVueThemeProvider',
        props: {
            cache: {
                type: Object as PropType<EmotionCache>,
                required: true,
            },
        },
        setup(props, { slots }) {
            const parentCache = inject(cacheKey, undefined)

            invariant(
                !parentCache,
                `You should never mount two <CacheProvider> in one subtree.`,
            )

            provide(
                cacheKey,
                computed(() => props.cache),
            )

            watchEffect(() => {
                if (props.cache) cache = props.cache
            })

            return () => slots.default && slots.default()
        },
    })

    function useTheme(): Ref<Theme> {
        return inject(themeKey, defaultThemeRef)
    }

    function useCache(): Ref<EmotionCache> {
        return inject(cacheKey, defaultCacheRef)
    }

    function css(style: CSSInterpolation, theme?: Theme) {
        const serialized = serializeStyles(
            [style],
            cache.registered,
            theme ? { theme } : undefined,
        )
        insertStyles(cache, serialized, false)
        return `${cache.key}-${serialized.name}`
    }

    function createClasses<P extends StylesObject>(
        stylesEffect: (theme: Theme) => P,
    ): ComputedRef<Record<keyof P, string>> {
        const themeRef = useTheme()

        return computed(() => {
            const styles = stylesEffect(themeRef.value)

            return Object.keys(styles).reduce((classesMap, name: keyof P) => {
                invariant(
                    typeof styles[name] !== 'function',
                    `You should not use function on ${name},
                        if you want to get theme you can just get in from 'createClasses' hook
                    `,
                )
                classesMap[name] = css(styles[name], themeRef.value)
                return classesMap
            }, {} as Record<keyof P, string>)
        })
    }

    function createStaticClasses<P extends StylesObject>(
        styles: P,
    ): Record<keyof P, string> {
        return Object.keys(styles).reduce((classesMap, name: keyof P) => {
            classesMap[name] = css(styles[name])
            return classesMap
        }, {} as Record<keyof P, string>)
    }

    function insertWithoutScoping(
        cache: EmotionCache,
        serialized: SerializedStyles,
    ) {
        if (cache.inserted[serialized.name] === undefined) {
            return cache.insert('', serialized, cache.sheet, true)
        }
    }

    const keyframes = (...args: CSSInterpolation[]) => {
        const serialized = serializeStyles(args, cache.registered)
        const animation = `animation-${serialized.name}`
        insertWithoutScoping(cache, {
            name: serialized.name,
            styles: `@keyframes ${animation}{${serialized.styles}}`,
        })

        return animation
    }
    const injectGlobal = (...args: CSSInterpolation[]) => {
        const serialized = serializeStyles(args, cache.registered)
        insertWithoutScoping(cache, serialized)
    }

    function injectGlobalStyle(
        stylesEffect: (theme: Theme) => CSSInterpolation | CSSInterpolation[],
    ) {
        const themeRef = useTheme()
        const cacheRef = useCache()

        watchEffect(() => {
            const styles = stylesEffect(themeRef.value)
            const serialized = serializeStyles(
                Array.isArray(styles) ? styles : [styles],
                cacheRef.value.registered,
            )
            insertWithoutScoping(cacheRef.value, serialized)
        })
    }

    const styled = createStyled<Theme>(useCache, useTheme).bind(null)

    tags.forEach((tagName) => {
        // $FlowFixMe: we can ignore this because its exposed type is defined by the CreateStyled type
        styled[tagName] = styled(tagName)
    })

    return {
        css,
        createClasses,
        createStaticClasses,
        styled,
        ThemeProvider,
        CacheProvider,
        useCache,
        useTheme,
        keyframes,
        injectGlobal,
        injectGlobalStyle,
    }
}

const defaultEmotion = createEmotion<Record<string, unknown>>()

// export const css = defaultEmotion.css
export const css = <Props>(...args: Interpolation<Props>[]): SerializedStyles =>
    serializeStyles(args, {})
export const keyframes = defaultEmotion.keyframes
export const createClasses = defaultEmotion.createClasses
export const createStaticClasses = defaultEmotion.createStaticClasses
export const ThemeProvider = defaultEmotion.ThemeProvider
export const CacheProvider = defaultEmotion.CacheProvider
export const useCache = defaultEmotion.useCache
export const useTheme = defaultEmotion.useTheme
export const styled = defaultEmotion.styled
