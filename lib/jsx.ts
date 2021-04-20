import { VNodeTypes, VNodeProps, createVNode } from 'vue'

export default function jsx(
    type: VNodeTypes | symbol,
    props?: (Record<string, unknown> & VNodeProps) | null,
    children?: unknown,
    patchFlag?: number,
    dynamicProps?: string[] | null,
    isBlockNode?: boolean,
) {
    if (!props) {
        return createVNode(
            type as any,
            props,
            children,
            patchFlag,
            dynamicProps,
            isBlockNode,
        )
    }

    const { css } = props

    if (!css) {
        return createVNode(
            type as any,
            props,
            children,
            patchFlag,
            dynamicProps,
            isBlockNode,
        )
    }
}
