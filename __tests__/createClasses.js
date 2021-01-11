import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { styled, ThemeProvider, createClasses } from '../lib'

/**
 * [!important]:
 *
 * You must keep your eyes on the reasult of Snapshot
 * if you did not find any styles outputed
 * maybe your demo style is duplicated from others
 *
 * This is because we run test in js-dom
 * and emotion auto cache inserted styles
 * and we have to clear `head` and `body` before every test
 *
 */

styled.h1 = styled('h1')

function matchEmotionSnapshot(wrapper) {
    const elements = Array.from(
        document.querySelectorAll('style[data-emotion]'),
    )

    const str = `
${elements.map((el) => el.innerHTML).join('\n')}

${wrapper.html()}
`

    expect(str).toMatchSnapshot()
}

describe('createClasses', () => {
    beforeEach(() => {
        // clean up
        document.head.innerHTML = ''
        document.body.innerHTML = ''
    })

    test('no dynamic', () => {
        const Comp = defineComponent(() => {
            const classesRef = createClasses(() => ({
                root: {
                    color: 'red',
                },
            }))

            return () => <div class={classesRef.value.root}></div>
        })

        matchEmotionSnapshot(mount(Comp))
    })

    test('basic render', () => {
        const fontSize = 20
        const Comp = defineComponent(() => {
            const classesRef = createClasses(() => ({
                root: {
                    color: 'blue',
                    fontSize: fontSize + 'px',
                    '@media (min-width: 420px)': {
                        color: 'yellow',
                    },
                },
            }))

            return () => <div class={classesRef.value.root}></div>
        })

        matchEmotionSnapshot(mount(Comp))
    })

    test('basic render with props change', (done) => {
        const Comp = defineComponent({
            props: {
                fontSize: Number,
            },
            setup(props) {
                const classesRef = createClasses(() => ({
                    root: {
                        fontSize: props.fontSize + 'px',
                    },
                }))

                return () => <div class={classesRef.value.root}></div>
            },
        })

        const wrapper = mount(Comp, {
            props: {
                fontSize: 20,
            },
        })

        matchEmotionSnapshot(wrapper)

        wrapper
            .setProps({
                fontSize: 30,
            })
            .then(() => {
                matchEmotionSnapshot(wrapper)
                done()
            })
    })

    test('basic render with theme', () => {
        const Comp = defineComponent({
            setup() {
                const classesRef = createClasses((theme) => ({
                    root: {
                        color: theme.color,
                    },
                }))

                return () => <div class={classesRef.value.root}></div>
            },
        })

        const wrapper = mount(() => (
            <ThemeProvider theme={{ color: 'redtheme' }}>
                <Comp />
            </ThemeProvider>
        ))

        matchEmotionSnapshot(wrapper)
    })

    test('basic render with theme change', (done) => {
        const Comp = defineComponent({
            setup() {
                const classesRef = createClasses((theme) => ({
                    root: {
                        color: theme.color,
                    },
                }))

                return () => <div class={classesRef.value.root}></div>
            },
        })

        const wrapper = mount(
            (props) => (
                <ThemeProvider theme={{ color: props.color }}>
                    <Comp />
                </ThemeProvider>
            ),
            { props: { color: 'start' } },
        )

        matchEmotionSnapshot(wrapper)

        wrapper
            .setProps({
                color: 'changed',
            })
            .then(() => {
                matchEmotionSnapshot(wrapper)
                done()
            })
    })

    test('pseudo selectors', () => {
        const Comp = defineComponent({
            setup() {
                const classesRef = createClasses(() => ({
                    button: {
                        color: 'blue',
                        '&:hover': {
                            color: 'pink',
                            '&:active': {
                                color: 'purple',
                            },
                            '&.some-class': {
                                color: 'yellow',
                            },
                        },
                    },
                }))

                return () => (
                    <button class={classesRef.value.button}>
                        Should be purple
                    </button>
                )
            },
        })

        const wrapper = mount(Comp)

        matchEmotionSnapshot(wrapper)
    })

    test('style array', () => {
        const Comp = defineComponent({
            setup() {
                const classesRef = createClasses(() => ({
                    root: [
                        {
                            color: 'red',
                        },
                        {
                            fontSize: '21px',
                        },
                    ],
                }))

                return () => (
                    <div class={classesRef.value.root}>Should be purple</div>
                )
            },
        })

        const wrapper = mount(Comp)

        matchEmotionSnapshot(wrapper)
    })
})
