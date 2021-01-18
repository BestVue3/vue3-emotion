// import { CSSInterpolation } from '@emotion/css'
import {
    serializeStyles,
    SerializedStyles,
    Interpolation,
    CSSInterpolation,
} from '@emotion/serialize'
import { EmotionCache, insertStyles } from '@emotion/utils'

// import { tags } from './styled/tags'

import { computed, ComputedRef, Ref, watchEffect } from 'vue'

import { useTheme, useCache } from './context'

// import createStyled from './styled'

function invariant(cond: boolean, message: string): void {
    if (!cond) throw new Error(message)
}

interface StylesObject {
    [name: string]: CSSInterpolation
}

// interface CreateEmotionOptions {
//     themeInjectKey?: symbol | string
//     cacheInjectKey?: symbol | string
// }

// export function css<Theme>(style: CSSInterpolation, theme?: Theme) {
//     const serialized = serializeStyles(
//         [style],
//         cache.registered,
//         theme ? { theme } : undefined,
//     )
//     insertStyles(cache, serialized, false)
//     return `${cache.key}-${serialized.name}`
// }

export function createClasses<P extends StylesObject, Theme>(
    stylesEffect: (theme: Theme) => P,
): ComputedRef<Record<keyof P, string>> {
    const themeRef: Ref<Theme> = useTheme()
    const cacheRef: Ref<EmotionCache> = useCache()

    return computed(() => {
        const theme = themeRef.value
        const cache = cacheRef.value

        const styles = stylesEffect(themeRef.value)

        return Object.keys(styles).reduce((classesMap, name: keyof P) => {
            invariant(
                typeof styles[name] !== 'function',
                `You should not use function on ${name},
                        if you want to get theme you can just get in from 'createClasses' hook
                    `,
            )

            const serialized = serializeStyles(
                [styles[name]],
                cache.registered,
                theme ? { theme } : undefined,
            )
            insertStyles(cache, serialized, false)
            classesMap[name] = `${cache.key}-${serialized.name}`
            return classesMap
        }, {} as Record<keyof P, string>)
    })
}

// function createStaticClasses<P extends StylesObject>(
//     styles: P,
// ): Record<keyof P, string> {
//     return Object.keys(styles).reduce((classesMap, name: keyof P) => {
//         classesMap[name] = css(styles[name])
//         return classesMap
//     }, {} as Record<keyof P, string>)
// }

function insertWithoutScoping(
    cache: EmotionCache,
    serialized: SerializedStyles,
) {
    if (cache.inserted[serialized.name] === undefined) {
        return cache.insert('', serialized, cache.sheet, true)
    }
}

// export const keyframes = (...args: CSSInterpolation[]) => {
//     const serialized = serializeStyles(args, cache.registered)
//     const animation = `animation-${serialized.name}`
//     insertWithoutScoping(cache, {
//         name: serialized.name,
//         styles: `@keyframes ${animation}{${serialized.styles}}`,
//     })

//     return animation
// }
// const injectGlobal = (...args: CSSInterpolation[]) => {
//     const serialized = serializeStyles(args, cache.registered)
//     insertWithoutScoping(cache, serialized)
// }

export function injectGlobalStyle<Theme>(
    stylesEffect: (theme: Theme) => CSSInterpolation | CSSInterpolation[],
) {
    const themeRef: Ref<Theme> = useTheme()
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

// const styled = createStyled<Theme>(useCache, useTheme).bind(null)

// tags.forEach((tagName) => {
//     styled[tagName] = styled(tagName)
// })

// return {
//     css,
//     createClasses,
//     createStaticClasses,
//     styled,
//     ThemeProvider,
//     CacheProvider,
//     useCache,
//     useTheme,
//     keyframes,
//     injectGlobal,
//     injectGlobalStyle,
// }

// const defaultEmotion = createEmotion<Record<string, unknown>>()

// // export const css = defaultEmotion.css
export const css = (
    ...args: Interpolation<Record<string, never>>[]
): SerializedStyles => serializeStyles(args, {})
// export const keyframes = defaultEmotion.keyframes
// export const createClasses = defaultEmotion.createClasses
// export const createStaticClasses = defaultEmotion.createStaticClasses
// export const ThemeProvider = defaultEmotion.ThemeProvider
// export const CacheProvider = defaultEmotion.CacheProvider
// export const useCache = defaultEmotion.useCache
// export const useTheme = defaultEmotion.useTheme
// export const styled = defaultEmotion.styled

type Keyframes = {
    name: string
    styles: string
    anim: 1
    toString: () => string
}

export const keyframes = (
    ...args: Interpolation<Record<string, never>>[]
): Keyframes => {
    const insertable = css(...args)
    const name = `animation-${insertable.name}`
    return {
        name,
        styles: `@keyframes ${name}{${insertable.styles}}`,
        anim: 1,
        toString() {
            return `_EMO_${this.name}_${this.styles}_EMO_`
        },
    }
}
