import { mount } from '@vue/test-utils'
import { styled } from '../lib'

let id = () => Math.random().toString(36)

test('string base - string as', () => {
    const Title = styled('h1')`
        color: green;
    `

    let h1Title = id()
    let h2Title = id()

    const wrapper = mount(() => (
        <article>
            <Title data-id={h1Title}>My Title</Title>
            <Title as="h2" data-id={h2Title}>
                My Subtitle
            </Title>
        </article>
    ))

    expect(wrapper.find(`[data-id="${h1Title}"]`).element.tagName).toBe('H1')
    expect(wrapper.find(`[data-id="${h2Title}"]`).element.tagName).toBe('H2')
})

test('styled string base - string as', () => {
    const Title = styled('h1')`
        color: green;
    `

    const Subtitle = styled(Title)`
        font-weight: 100;
    `

    let h1Title = id()
    let h1Subtitle = id()
    let h3Subtitle = id()

    const wrapper = mount(() => (
        <article>
            <Title data-id={h1Title}>My Title</Title>
            <Subtitle data-id={h1Subtitle}>My Subtitle</Subtitle>
            <Subtitle as="h3" data-id={h3Subtitle}>
                My smaller Subtitle
            </Subtitle>
        </article>
    ))

    expect(wrapper.find(`[data-id="${h1Title}"]`).element.tagName).toBe('H1')
    expect(wrapper.find(`[data-id="${h1Subtitle}"]`).element.tagName).toBe('H1')
    expect(wrapper.find(`[data-id="${h3Subtitle}"]`).element.tagName).toBe('H3')
})

test('composite base - string as', () => {
    const Title = styled((props) => <h1 {...props} />)`
        color: green;
    `
    let h1Title = id()
    let h3Title = id()

    const wrapper = mount(() => (
        <article>
            <Title data-id={h1Title}>My Title</Title>
            <Title as="h3" data-id={h3Title}>
                My Subtitle
            </Title>
        </article>
    ))

    expect(wrapper.find(`[data-id="${h1Title}"]`).element.tagName).toBe('H1')
    expect(wrapper.find(`[data-id="${h3Title}"]`).element.tagName).toBe('H1')
    expect(wrapper.find(`[data-id="${h3Title}"]`).attributes().as).toBe('h3')
})

test('forward as - string base', () => {
    const Title = styled('h1', {
        shouldForwardProp: (prop) => prop !== 'theme',
    })`
        color: green;
    `

    let h1Title = id()
    let h1WithAsProp = id()

    const wrapper = mount(() => (
        <article>
            <Title data-id={h1Title}>My Title</Title>
            <Title as="h2" data-id={h1WithAsProp}>
                My Subtitle
            </Title>
        </article>
    ))

    expect(wrapper.find(`[data-id="${h1Title}"]`).element.tagName).toBe('H1')
    expect(wrapper.find(`[data-id="${h1WithAsProp}"]`).element.tagName).toBe(
        'H1',
    )
    expect(wrapper.find(`[data-id="${h1WithAsProp}"]`).attributes().as).toBe(
        'h2',
    )
})

test('forward as - composite base', () => {
    const Title = styled((props) => <h1 {...props} />, {
        shouldForwardProp: (prop) => prop !== 'theme',
    })`
        color: green;
    `
    let h1Title = id()
    let h1WithAsProp = id()

    const wrapper = mount(() => (
        <article>
            <Title data-id={h1Title}>My Title</Title>
            <Title as="h2" data-id={h1WithAsProp}>
                My Subtitle
            </Title>
        </article>
    ))

    expect(wrapper.find(`[data-id="${h1Title}"]`).element.tagName).toBe('H1')
    expect(wrapper.find(`[data-id="${h1WithAsProp}"]`).element.tagName).toBe(
        'H1',
    )
    expect(wrapper.find(`[data-id="${h1WithAsProp}"]`).attributes().as).toBe(
        'h2',
    )
})
