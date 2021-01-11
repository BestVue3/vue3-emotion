import {
    DefineComponent,
    VNodeTypes,
    VNode,
    RendererNode,
    RendererElement,
} from 'vue'
import isPropValid from '@emotion/is-prop-valid'
import { Interpolation } from '@emotion/serialize'

export interface StyledOptions {
    label?: string
    shouldForwardProp?: (prop: string) => boolean
    target?: string
}

type Empty = Record<string, never>

export interface StyledComponentCommonProps<Theme> {
    theme: Theme
    as: VNodeTypes
}

export type StyledComponent<Props> = DefineComponent<
    Props,
    () => VNode<
        RendererNode,
        RendererElement,
        {
            [key: string]: any
        }
    >,
    Empty,
    Empty
> & {
    toString: () => string
    withComponent: (
        nextTag: VNodeTypes,
        nextOptions?: StyledOptions,
    ) => StyledComponent<Props>
}

export type PrivateStyledComponent<Props> = StyledComponent<Props> & {
    __emotion_real: StyledComponent<Props>
    __emotion_base: any
    __emotion_styles: any
    __emotion_forwardProp: any
}

const testOmitPropsOnStringTag = isPropValid
const testOmitPropsOnComponent = (key: string) => key !== 'theme'

export const getDefaultShouldForwardProp = (tag: VNodeTypes) =>
    typeof tag === 'string' &&
    // 96 is one less than the char code
    // for "a" so this is checking that
    // it's a lowercase character
    tag.charCodeAt(0) > 96
        ? testOmitPropsOnStringTag
        : testOmitPropsOnComponent

export const composeShouldForwardProps = <Props>(
    tag: PrivateStyledComponent<Props>,
    options: StyledOptions | void,
    isReal: boolean,
) => {
    let shouldForwardProp
    if (options) {
        const optionsShouldForwardProp = options.shouldForwardProp
        shouldForwardProp =
            tag.__emotion_forwardProp && optionsShouldForwardProp
                ? (propName: string) =>
                      tag.__emotion_forwardProp(propName) &&
                      optionsShouldForwardProp(propName)
                : optionsShouldForwardProp
    }

    if (typeof shouldForwardProp !== 'function' && isReal) {
        shouldForwardProp = tag.__emotion_forwardProp
    }

    return shouldForwardProp
}

export type CreateStyledComponent = <Props, Theme = Record<string, unknown>>(
    ...args: Interpolation<Props & StyledComponentCommonProps<Theme>>[]
) => PrivateStyledComponent<Props & StyledComponentCommonProps<Theme>>

export type CreateStyled = {
    (tag: VNodeTypes, options?: StyledOptions): CreateStyledComponent
} & Record<keyof JSX.IntrinsicElements, CreateStyledComponent>
