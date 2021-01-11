import { defineComponent } from 'vue'
import { createClasses, styled } from '../lib'

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

export default defineComponent({
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
            <Button class={classesRef.value.button}>Should be purple</Button>
        )
    },
})
