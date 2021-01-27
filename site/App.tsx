/**
 * 如果这个文件在vscode里面没有eslint提醒
 * 你可能需要设置`eslint.validate`并且把`typescriptreact`加入进去
 * See: https://stackoverflow.com/questions/56557988/eslint-in-vsc-not-working-for-ts-and-tsx-files
 */

import { defineComponent, reactive, HTMLAttributes, shallowRef } from 'vue'

// import { spacing, SpacingProps } from '@material-ui/system'

import { createClasses, styled } from '..'
// import estyled from '@emotion/styled'
// import { spacing, SpacingProps } from '@material-ui/system'
import { space, SpaceProps, FlexProps, FontSizeProps } from 'styled-system'

const makeDiv = styled('div')

function getText(t: string) {
    return `${t} hello222`
}

const P = makeDiv<SpaceProps & HTMLAttributes>(space, {
    color: 'red',
    ':hover': {
        padding: '12px',
    },
})

const H1 = styled('h1')<FlexProps & FontSizeProps>((props: any) => ({
    fontSize: props.fontSize,
}))
const H2 = styled(H1)<FlexProps & FontSizeProps>(
    (props: any) => ({ flex: props.flex }),
    {
        display: 'flex',
    },
)

// const arr = [1, 2, 3]

export default defineComponent({
    name: 'test',
    setup() {
        const state = reactive({
            index: 0,
        })

        const classesRef = createClasses(() => ({
            container: [
                {
                    color: state.index === 0 ? 'black' : 'red',
                    ':hover': {
                        color: 'yellow',
                    },
                },
                null,
            ],
        }))

        const divRef = shallowRef()

        return () => (
            <div
                ref={divRef}
                class={classesRef.value.container}
                onClick={() => (state.index = state.index === 0 ? 1 : 0)}
            >
                Hello Vite1 {state.index}
                <P
                    class={{ toString: () => 'hehe' }}
                    id="12"
                    m="20px"
                    pb={40}
                    theme={{ xxx: 123 }}
                >
                    He
                </P>
                <H1 flex="1" fontSize={24}>
                    {getText('H11')}
                </H1>
                <H2 flex="1" fontSize={24}>
                    Hello
                </H2>
            </div>
        )
    },
})
