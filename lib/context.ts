import {
    computed,
    defineComponent,
    PropType,
    inject,
    provide,
    Ref,
    shallowRef,
    watchEffect,
} from 'vue'

import createCache, { EmotionCache } from '@emotion/cache'

function invariant(cond: boolean, message: string): void {
    if (!cond) throw new Error(message)
}

const themeKey = Symbol('emotion-vue-inject-theme-key')
const cacheKey = Symbol('emotion-vue-inject-cache-key')

const defaultThemeRef = shallowRef({})
const defaultCache = createCache({
    key: 'css',
})

const defaultCacheRef = shallowRef(defaultCache)

let cache: EmotionCache = defaultCache

export const ThemeProvider = defineComponent({
    name: 'EmotionVueThemeProvider',
    props: {
        theme: {
            type: Object,
            required: true,
        },
    },
    setup(props, { slots }) {
        const theme = computed(() => props.theme)

        provide(themeKey, theme)

        return () => slots.default && slots.default()
    },
})

export const CacheProvider = defineComponent({
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

export function useTheme<Theme>(): Ref<Theme> {
    return inject(themeKey, defaultThemeRef as Ref<Theme>)
}

export function useCache(): Ref<EmotionCache> {
    return inject(cacheKey, defaultCacheRef)
}
