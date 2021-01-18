import createStyled from './base'
import { tags } from './tags'

const newStyled = createStyled()

tags.forEach((tagName) => {
    newStyled[tagName] = newStyled(tagName)
})

export default newStyled

export { createStyled }
