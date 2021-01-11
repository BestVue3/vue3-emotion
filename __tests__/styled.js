import { mount } from '@vue/test-utils'
import { styled, css, ThemeProvider, keyframes, createClasses } from '../lib'

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

describe('styled', () => {
    beforeEach(() => {
        // clean up
        document.head.innerHTML = ''
        document.body.innerHTML = ''
    })

    let flex = 0 // to prevent insert same class

    test('no dynamic', () => {
        const H1 = styled.h1`
            float: left;
        `

        matchEmotionSnapshot(mount(() => <H1>hello world</H1>))
    })

    test('basic render', () => {
        const fontSize = 20
        const H1 = styled.h1`
            color: blue;
            font-size: ${fontSize + 'px'};
            @media (min-width: 420px) {
                color: blue;
            }
        `

        matchEmotionSnapshot(mount(() => <H1>hello world</H1>))
    })

    test('basic render with object as style', () => {
        const fontSize = 20
        const H1 = styled.h1({ fontSize })

        matchEmotionSnapshot(mount(() => <H1>hello world</H1>))
    })

    test('object as style', () => {
        const H1 = styled.h1(
            (props) => ({
                fontSize: props.fontSize,
            }),
            (props) => ({ flex: props.flex }),
            { display: 'flex' },
        )

        matchEmotionSnapshot(
            mount(() => (
                <H1 flex={flex++} fontSize={20}>
                    hello world
                </H1>
            )),
        )
    })

    // TODO: won't implemenet this since vue handle `class` differently
    // test('object as className', () => {
    //     const myclass = { toString: () => 'myclass' }
    //     const Comp = styled('div')``

    //     matchEmotionSnapshot(mount(() => <Comp class={myclass} />))
    // })

    test('glamorous style api & composition', () => {
        const H1 = styled.h1((props) => ({ fontSize: props.fontSize }))
        const H2 = styled(H1)((props) => ({ flex: props.flex }), {
            display: 'flex',
        })

        matchEmotionSnapshot(
            mount(() => (
                <H2 flex={flex++} fontSize={20}>
                    hello world
                </H2>
            )),
        )
    })

    test('inline function return value is a function', () => {
        const fontSize = () => 20
        const Blue = styled('h1')`
            font-size: ${() => fontSize}px;
        `

        matchEmotionSnapshot(mount(() => <Blue>hello world</Blue>))
    })

    test('call expression', () => {
        const fontSize = 21
        const Div = styled('div')`
            font-size: ${fontSize}px;
        `

        matchEmotionSnapshot(mount(() => <Div>hello world</Div>))
    })

    test('nested', () => {
        const fontSize = '20px'
        const H1 = styled.h1`
            font-size: ${fontSize};
        `

        const Thing = styled('div')`
            display: flex;
            & div {
                color: green;

                & span {
                    color: red;
                }
            }
        `

        matchEmotionSnapshot(
            mount(() => (
                <Thing>
                    hello <H1>This will be green</H1> world
                </Thing>
            )),
        )
    })

    test('random expressions undefined return', () => {
        const H1 = styled('h1')`
            ${(props) =>
                props.prop &&
                css`
                    font-size: 1rem;
                `};
            color: green;
        `

        matchEmotionSnapshot(
            mount(() => <H1 className={'legacy__class'}>hello world</H1>),
        )
    })

    test('random object expression', () => {
        const margin = (t, r, b, l) => {
            return () => ({
                marginTop: t,
                marginRight: r,
                marginBottom: b,
                marginLeft: l,
            })
        }
        const H1 = styled.h1`
            background-color: hotpink;
            ${(props) => props.prop && { fontSize: '1rem' }};
            ${margin(0, 'auto', 0, 'auto')};
            color: green;
        `

        matchEmotionSnapshot(
            mount(() => (
                <H1 className={'legacy__class'} prop>
                    hello world
                </H1>
            )),
        )
    })

    test('composition', () => {
        const fontSize = 20
        const H1 = styled('h1')`
            font-size: ${fontSize + 'px'};
        `

        const H2 = styled(H1)`
            font-size: ${(fontSize * 2) / 3 + 'px'};
        `

        matchEmotionSnapshot(
            mount(() => <H2 className={'legacy__class'}>hello world</H2>),
        )
    })

    test('input placeholder', () => {
        const Input = styled('input')`
            ::placeholder {
                background-color: green;
            }
        `
        matchEmotionSnapshot(mount(() => <Input>hello world</Input>))
    })

    test('input placeholder object', () => {
        const Input = styled('input')({
            '::placeholder': {
                backgroundColor: 'green',
            },
        })

        matchEmotionSnapshot(mount(() => <Input>hello world</Input>))
    })

    test('object composition', () => {
        const imageStyles = css({ width: 96, height: 96 })

        css([{ color: 'blue' }])

        const red = css([{ color: 'red' }])

        const blue = css([red, { color: 'blue' }])

        const prettyStyles = css([
            {
                borderRadius: '50%',
                transition: 'transform 400ms ease-in-out',
                ':hover': {
                    transform: 'scale(1.2)',
                },
            },
            { border: '3px solid currentColor' },
        ])

        const Avatar = styled('img')`
            ${prettyStyles};
            ${imageStyles};
            ${blue};
        `

        matchEmotionSnapshot(mount(Avatar))
    })

    test('handles more than 10 dynamic properties', () => {
        const H1 = styled('h1')`
            text-decoration: ${'underline'};
            border-right: solid blue 54px;
            background: ${'white'};
            color: ${'black'};
            display: ${'block'};
            border-radius: ${'3px'};
            padding: ${'25px'};
            width: ${'500px'};
            z-index: ${100};
            font-size: ${'18px'};
            text-align: ${'center'};
            border-left: ${(p) => p.theme.blue};
        `

        matchEmotionSnapshot(
            mount(() => (
                <H1 className={'legacy__class'} theme={{ blue: 'blue' }}>
                    hello world
                </H1>
            )),
        )
    })

    test('function in expression', () => {
        const fontSize = 20
        const H1 = styled('h1', { label: 'H1' })`
            font-size: ${fontSize + 'px'};
        `

        const H2 = styled(H1)`
            font-size: ${({ scale }) => fontSize * scale + 'px'};
        `

        matchEmotionSnapshot(
            mount(() => (
                <H2 class={'legacy__class'} scale={2}>
                    hello world
                </H2>
            )),
        )
    })

    test('composition', () => {
        const fontSize = '20px'

        const cssA = css`
            color: blue;
        `

        const cssB = css`
            ${cssA};
            color: red;
        `

        const BlueH1 = styled('h1')`
            ${cssB};
            color: blue;
            font-size: ${fontSize};
        `

        const FinalH2 = styled(BlueH1)`
            font-size: 32px;
        `

        matchEmotionSnapshot(
            mount(() => (
                <FinalH2 class={'legacy__class'} scale={2}>
                    hello world
                </FinalH2>
            )),
        )
    })

    test('higher order component', () => {
        const fontSize = 20
        const Content = styled('div')`
            font-size: ${fontSize}px;
        `

        const squirtleBlueBackground = css`
            background-color: #7fc8d6;
        `

        const flexColumn = (Component) => {
            const NewComponent = styled(Component)`
                ${squirtleBlueBackground};
                background-color: '#343a40';
                flex-direction: column;
            `

            return NewComponent
        }

        const ColumnContent = flexColumn(Content)

        matchEmotionSnapshot(mount(() => <ColumnContent />))
    })

    test('composition based on props', () => {
        const cssA = css`
            color: blue;
        `

        const cssB = css`
            color: green;
        `

        const H1 = styled('h1')`
            ${(props) => (props.a ? cssA : cssB)};
        `

        matchEmotionSnapshot(mount(() => <H1 a>hello world</H1>))

        matchEmotionSnapshot(mount(() => <H1>hello world</H1>))
    })

    test('composition of nested pseudo selectors', () => {
        const defaultLinkStyles = {
            '&:hover': {
                color: 'blue',
                '&:active': {
                    color: 'red',
                },
            },
        }

        const buttonStyles = () => ({
            ...defaultLinkStyles,
            fontSize: '2rem',
            padding: 16,
        })

        const Button = styled('button')(buttonStyles)

        matchEmotionSnapshot(
            mount({
                setup() {
                    const classesRef = createClasses(() => ({
                        button: {
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
                        <Button class={classesRef.value.button}>
                            Should be purple
                        </Button>
                    )
                },
            }),
        )
    })

    test('objects', () => {
        const H1 = styled('h1')({ padding: 10 }, (props) => ({
            display: props.display,
        }))
        matchEmotionSnapshot(mount(() => <H1 display="flex">hello world</H1>))
    })

    test('objects with spread properties', () => {
        const defaultText = { fontSize: 20 }
        const Figure = styled('figure')({ ...defaultText })
        matchEmotionSnapshot(mount(() => <Figure>hello world</Figure>))
    })

    test('composing components', () => {
        const Button = styled('button')`
            color: green;
        `
        const OtherButton = styled(Button)`
            display: none;
        `

        const AnotherButton = styled(OtherButton)`
            display: flex;
            justify-content: center;
        `
        matchEmotionSnapshot(
            mount(() => <AnotherButton>hello world</AnotherButton>),
        )
    })

    // TODO: needed in vue3?
    // test('with higher order component that hoists statics', () => {
    //     const superImportantValue = 'hotpink'
    //     const hoc = (BaseComponent) => {
    //         const NewComponent = (props) => (
    //             <BaseComponent someProp={superImportantValue} {...props} />
    //         )
    //         return hoistNonReactStatics(NewComponent, BaseComponent)
    //     }
    //     const SomeComponent = hoc(styled.div`
    //         display: flex;
    //         color: ${(props) => props.someProp};
    //     `)
    //     const FinalComponent = styled(SomeComponent)`
    //         padding: 8px;
    //     `
    //     const tree = renderer.create(<FinalComponent />).toJSON()
    //     expect(tree).toMatchSnapshot()
    // })

    test('prop filtering', () => {
        const Link = styled('a')`
            color: greenfiltering;
        `
        const rest = { m: [3], pt: [4] }

        matchEmotionSnapshot(
            mount(() => (
                <Link
                    a
                    aria-label="some label"
                    b
                    cool
                    data-wow="value"
                    filtering
                    href="link"
                    is
                    prop
                    wow
                    {...rest}
                >
                    hello world
                </Link>
            )),
        )
    })

    test('no prop filtering on non string tags', () => {
        const Link = styled((props) => <a {...props} />)`
            color: green;
        `

        matchEmotionSnapshot(
            mount(() => (
                <Link
                    a
                    aria-label="some label"
                    b
                    cool
                    data-wow="value"
                    filtering
                    href="link"
                    is
                    prop
                    wow
                >
                    hello world
                </Link>
            )),
        )
    })

    test('no prop filtering on string tags started with upper case', () => {
        const Link = styled('SomeCustomLink')`
            color: green;
        `

        matchEmotionSnapshot(
            mount(() => (
                <Link
                    a
                    aria-label="some label"
                    b
                    cool
                    data-wow="value"
                    filtering
                    href="link"
                    is
                    prop
                    wow
                >
                    hello world
                </Link>
            )),
        )
    })

    test('prop filtering on composed styled components that are string tags', () => {
        const BaseLink = styled('a')`
            background-color: hotpink;
        `
        const Link = styled(BaseLink)`
            color: green;
        `

        matchEmotionSnapshot(
            mount(() => (
                <Link
                    a
                    aria-label="some label"
                    b
                    cool
                    data-wow="value"
                    filtering
                    href="link"
                    is
                    prop
                    wow
                >
                    hello world
                </Link>
            )),
        )
    })

    test('throws if undefined is passed as the component', () => {
        expect(
            () =>
                // $FlowFixMe
                styled(undefined)`
                    display: flex;
                `,
        ).toThrowErrorMatchingSnapshot()
    })
    test('withComponent will replace tags but keep styling classes', () => {
        const Title = styled('h1')`
            color: black;
        `
        const Subtitle = Title.withComponent('h2')

        matchEmotionSnapshot(
            mount(() => (
                <article>
                    <Title>My Title</Title>
                    <Subtitle>My Subtitle</Subtitle>
                </article>
            )),
        )
    })
    test('withComponent with function interpolation', () => {
        const Title = styled('h1')`
            color: ${(props) => props.color || 'yellow'};
        `
        const Subtitle = Title.withComponent('h2')

        matchEmotionSnapshot(
            mount(() => (
                <article>
                    <Title>My Title</Title>
                    <Subtitle>My Subtitle</Subtitle>
                </article>
            )),
        )
    })

    test('withComponent does carry styles from flattened component', () => {
        const SomeComponent = styled('div')`
            color: green;
        `
        const AnotherComponent = styled(SomeComponent)`
            color: hotpink;
        `
        const OneMoreComponent = AnotherComponent.withComponent('p')
        matchEmotionSnapshot(mount(() => <OneMoreComponent />))
    })

    test('theming', () => {
        const Div = styled('div')`
            color: ${(props) => props.theme.primary};
        `
        matchEmotionSnapshot(
            mount(() => (
                <ThemeProvider theme={{ primary: 'yellowpick' }}>
                    <Div>this should be yellowpick</Div>
                </ThemeProvider>
            )),
        )
    })
    test('same component rendered multiple times', () => {
        const SomeComponent = styled('div')`
            color: greenpark;
        `

        matchEmotionSnapshot(mount(SomeComponent))

        expect(mount(SomeComponent).html()).toEqual(mount(SomeComponent).html())
        matchEmotionSnapshot(
            mount(() => (
                <SomeComponent>
                    <SomeComponent />
                    <SomeComponent />
                </SomeComponent>
            )),
        )
    })
    test('component selectors', () => {
        let Target = styled('div', {
            // if anyone is looking this
            // please don't do this.
            // use the babel plugin/macro.
            target: 'e322f2d3tbrgf2e0',
        })`
            color: hotpinkse1;
        `
        let SomeComponent = styled('div')`
            color: greengrey;
            ${Target.toString()} {
                color: yellow;
            }
        `
        matchEmotionSnapshot(
            mount(() => (
                <SomeComponent>
                    <Target />
                </SomeComponent>
            )),
        )
    })
    test('keyframes with css call', () => {
        let SomeComp = styled('div')(
            css`
                animation: ${keyframes({
                    'from,to': { color: 'green' },
                    '50%': { color: 'hotpink' },
                })};
            `,
        )
        matchEmotionSnapshot(mount(SomeComp))
    })
})
