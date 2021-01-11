import { mount } from '@vue/test-utils'
import { styled, css } from '../lib'

console.error = jest.fn()

afterEach(() => {
    jest.clearAllMocks()
})

it('warns about illegal escape sequences inside first quasi of template literal', () => {
    styled('div')`
    :before {
      content: '\00d7';
    }
  `

    expect(console.error.mock.calls[0]).toMatchInlineSnapshot(`
    Array [
      "You have illegal escape sequence in your template literal, most likely inside content's property value.
    Because you write your CSS inside a JavaScript string you actually have to do double escaping, so for example \\"content: '\\\\00d7';\\" should become \\"content: '\\\\\\\\00d7';\\".
    You can read more about this here:
    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#ES2018_revision_of_illegal_escape_sequences",
    ]
  `)
})

it('warns about illegal escape sequences inside non-first quasi of template literal', () => {
    const color = css`
        color: hotpink;
    `
    styled('div')`
    background-color: black;
    ${color};
    :before {
      content: '\00d7';
    }
  `

    expect(console.error.mock.calls[0]).toMatchInlineSnapshot(`
    Array [
      "You have illegal escape sequence in your template literal, most likely inside content's property value.
    Because you write your CSS inside a JavaScript string you actually have to do double escaping, so for example \\"content: '\\\\00d7';\\" should become \\"content: '\\\\\\\\00d7';\\".
    You can read more about this here:
    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#ES2018_revision_of_illegal_escape_sequences",
    ]
  `)
})

it("warns about undefined being passed as object style's key", () => {
    let ListItem

    const List = styled('ul')({ [ListItem]: { color: 'hotpink' } })

    mount(() => <List />)

    expect(console.error.mock.calls[0]).toMatchInlineSnapshot(`
    Array [
      "You have passed in falsy value as style object's key (can happen when in example you pass unexported component as computed key).",
    ]
  `)
})
