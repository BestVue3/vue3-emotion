import { computed, createVNode, defineComponent, Ref, VNodeTypes } from 'vue'
import {
    getDefaultShouldForwardProp,
    composeShouldForwardProps,
    StyledOptions,
    CreateStyled,
    PrivateStyledComponent,
    StyledComponentCommonProps,
} from './utils'
import { getRegisteredStyles, insertStyles } from '@emotion/utils'
import { serializeStyles, Interpolation } from '@emotion/serialize'

import { useTheme, useCache } from '../context'

const ILLEGAL_ESCAPE_SEQUENCE_ERROR = `You have illegal escape sequence in your template literal, most likely inside content's property value.
Because you write your CSS inside a JavaScript string you actually have to do double escaping, so for example "content: '\\00d7';" should become "content: '\\\\00d7';".
You can read more about this here:
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#ES2018_revision_of_illegal_escape_sequences`

// let isBrowser = typeof document !== 'undefined'

// const commonProps = {
//     // theme: Object as PropType<Record<string, unknown>>,
// } as const

export default function createStyled<Theme extends unknown>() {
    const styled = (tag: any, options?: StyledOptions) => {
        if (process.env.NODE_ENV !== 'production') {
            if (tag === undefined) {
                throw new Error(
                    'You are trying to create a styled element with an undefined component.\nYou may have forgotten to import it.',
                )
            }
        }
        const isReal = tag.__emotion_real === tag
        const baseTag = (isReal && tag.__emotion_base) || tag

        let identifierName: string | undefined
        let targetClassName: string | undefined
        if (options !== undefined) {
            identifierName = options.label
            targetClassName = options.target
        }

        const shouldForwardProp = composeShouldForwardProps(
            tag,
            options,
            isReal,
        )
        const defaultShouldForwardProp =
            shouldForwardProp || getDefaultShouldForwardProp(baseTag)
        const shouldUseAs = !defaultShouldForwardProp('as')

        return function <ComponentProps extends unknown>(
            ...styleArgs: Interpolation<
                ComponentProps & StyledComponentCommonProps<Theme>
            >[]
        ): PrivateStyledComponent<
            ComponentProps & StyledComponentCommonProps<Theme>
        > {
            const args: any = styleArgs

            const styles =
                isReal && tag.__emotion_styles !== undefined
                    ? tag.__emotion_styles.slice(0)
                    : []

            if (identifierName !== undefined) {
                styles.push(`label:${identifierName};`)
            }
            if (args[0] == null || args[0].raw === undefined) {
                styles.push(...args)
            } else {
                if (
                    process.env.NODE_ENV !== 'production' &&
                    args[0][0] === undefined
                ) {
                    console.error(ILLEGAL_ESCAPE_SEQUENCE_ERROR)
                }
                styles.push(args[0][0])
                const len = args.length
                let i = 1
                for (; i < len; i++) {
                    if (
                        process.env.NODE_ENV !== 'production' &&
                        args[0][i] === undefined
                    ) {
                        console.error(ILLEGAL_ESCAPE_SEQUENCE_ERROR)
                    }
                    styles.push(args[i], args[0][i])
                }
            }

            // const propsDefine =
            //     typeof tag === 'string'
            //         ? commonProps
            //         : ({
            //               ...commonProps,
            //               ...tag.props,
            //           } as const)

            const Styled = defineComponent({
                name:
                    identifierName !== undefined
                        ? identifierName
                        : `Styled(${
                              typeof baseTag === 'string'
                                  ? baseTag
                                  : baseTag.displayName ||
                                    baseTag.name ||
                                    'Component'
                          })`,
                inheritAttrs: false,
                // props: propsDefine,
                setup(p, { attrs, slots }) {
                    const contextThemeRef = useTheme()
                    const cacheRef = useCache()

                    // const attrs = {
                    //     ...passedAttrs,
                    //     ...p,
                    // }

                    const finalTagRef = computed(() => {
                        return (shouldUseAs && attrs.as) || baseTag
                    })

                    const newPropsRef = computed(() => {
                        const cache = cacheRef.value
                        let className = ''
                        const classInterpolations: any[] = []
                        let mergedProps = attrs
                        if (attrs.theme == null) {
                            mergedProps = {}
                            for (const key in attrs) {
                                mergedProps[key] = attrs[key]
                            }
                            mergedProps.theme = contextThemeRef.value
                        }

                        if (typeof attrs.class === 'string') {
                            className = getRegisteredStyles(
                                cache.registered,
                                classInterpolations,
                                attrs.class,
                            )
                        } else if (attrs.class != null) {
                            className = `${attrs.class} `
                        }

                        const serialized = serializeStyles(
                            styles.concat(classInterpolations),
                            cache.registered,
                            mergedProps,
                        )

                        const finalTag = finalTagRef.value

                        const rules = insertStyles(
                            cache,
                            serialized,
                            typeof finalTag === 'string',
                        )
                        className += `${cache.key}-${serialized.name}`
                        if (targetClassName !== undefined) {
                            className += ` ${targetClassName}`
                        }

                        const finalShouldForwardProp =
                            shouldUseAs && shouldForwardProp === undefined
                                ? getDefaultShouldForwardProp(finalTag)
                                : defaultShouldForwardProp

                        const newProps: Record<string, unknown> = {}

                        for (const key in attrs) {
                            if (shouldUseAs && key === 'as') continue

                            if (finalShouldForwardProp(key)) {
                                newProps[key] = attrs[key]
                            }
                        }

                        newProps.class = className

                        return newProps
                    })

                    return () => {
                        return createVNode(
                            finalTagRef.value,
                            newPropsRef.value,
                            slots,
                        )
                        // if (!isBrowser && rules !== undefined) {
                        //     let serializedNames = serialized.name
                        //     let next = serialized.next
                        //     while (next !== undefined) {
                        //         serializedNames += ' ' + next.name
                        //         next = next.next
                        //     }
                        //     return (
                        //         <>
                        //             <style
                        //                 {...{
                        //                     [`data-emotion`]: `${cache.key} ${serializedNames}`,
                        //                     dangerouslySetInnerHTML: { __html: rules },
                        //                     nonce: cache.sheet.nonce,
                        //                 }}
                        //             />
                        //             {ele}
                        //         </>
                        //     )
                        // }
                    }
                },
            }) as PrivateStyledComponent<
                ComponentProps & StyledComponentCommonProps<Theme>
            >

            // Styled.defaultProps = tag.defaultProps
            Styled.__emotion_real = Styled
            Styled.__emotion_base = baseTag
            Styled.__emotion_styles = styles
            Styled.__emotion_forwardProp = shouldForwardProp

            Object.defineProperty(Styled, 'toString', {
                value() {
                    if (
                        targetClassName === undefined &&
                        process.env.NODE_ENV !== 'production'
                    ) {
                        return 'NO_COMPONENT_SELECTOR'
                    }
                    // $FlowFixMe: coerce undefined to string
                    return `.${targetClassName}`
                },
            })

            Styled.withComponent = (
                nextTag: VNodeTypes,
                nextOptions?: StyledOptions,
            ) => {
                return styled(nextTag, {
                    ...options,
                    // $FlowFixMe
                    ...nextOptions,
                    shouldForwardProp: composeShouldForwardProps(
                        Styled,
                        nextOptions,
                        true,
                    ),
                })(...styles)
            }

            return Styled
        }
    }

    return styled as CreateStyled
}
