import { mount } from '@vue/test-utils'

import { styled, css, keyframes } from '../lib'

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

beforeEach(() => {
    // clean up
    document.head.innerHTML = ''
    document.body.innerHTML = ''
})

test('nested function using css', () => {
    let Comp = styled('div')`
        color: blue;
        border: 2px solid #000;
        ${() => css`
            background-color: red;
        `};
        padding: 30px;
    `
    const wrapper = mount(Comp)

    matchEmotionSnapshot(wrapper)
    // expect(wrapper.html()).toMatchSnapshot()
})

test('nested function using css and keyframes', () => {
    let Comp = styled('div')`
        ${() => css`
            animation: ${keyframes({
                'from,to': { color: 'green' },
                '50%': {
                    color: 'hotpink',
                },
            })};
        `};
    `
    matchEmotionSnapshot(mount(Comp))
})
