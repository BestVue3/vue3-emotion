# Emotion for Vue3

> 本项目仍然在开发初期，很可能会有 API 的调整，你需要自行决定是否要在正式项目中使用。如果你有任何建议或者发现了任何的 bug，你可以提 issue 进行反馈。如果你希望贡献代码，PR 也是非常棒的。

Emotion 是一个非常强大的 Css in Js 库，他提供我们通过 Js 来管理 Css 的能力，以此让 Js 强大的灵活性能够发挥到样式管理上。一些单纯通过 Css 难以解决的问题，在 Emotion 中变得非常的简单。比如：

-   动态切换主题或者主题中的某些配置
-   函数式地复用样式片段
-   根据 props 或者 state 切换样式
-   可以利用所有 js 的特性来维护你的样式
-   styled component 通过 props 来控制样式的能力
-   实现样式完全可定制的组件
-   样式代码自然分片

同时因为提供了完整的样式类型声明，所以只要你的编辑器能自动识别 ts(vscode 和 webstrom 都支持)，你就可以获得完善的样式代码提示。

# 安装

```bash
npm install @bv3/emotion -S

# or using yarn

yarn add @bv3/emotion -S
```

# API

### Basic Usage

我们提供了一个`createClasses` hook 来注册样式

```js
import { createClasses } from '@bv3/emotion'

const EmotionComponent = defineComponent({
  props: {
    color: String
  }
  setup(props) {
    const classesRef = createClasses(() => ({
      root: {
        background: props.bgColor
      }
    }))

    return () => {
      const { root } = classesRef.value
      return <div class={root}>Hello Emotion Vue3</div>
    }
  }
})
```

当你使用该组件的时候，你就可以通过指定`bgColor`这个 prop 来控制组件的背景颜色，怎么样，非常简单吧。

### 条件样式

你可以非常简单地根据某些条件来指定是否使用某些样式，比如根据是否是亮色主题来确定背景颜色：

```js
createClasses(() => ({
    root: {
        background: props.light ? '#fff' : '#000',
    },
}))
```

你不仅可以控制某个样式，你还可以控制一组样式：

```js
createClasses(() => ({
    root: [
        {
            background: props.light ? '#fff' : '#000',
        },
        props.active
            ? {
                  color: 'red',
              }
            : {},
    ],
}))
```

### 主题

主题是管理样式中非常重要的一点，如果我们对于主题配置的抽象合理，就能够让我们在未来想要整体调整样式时变得非常轻松，这非常有利于长期项目的维护和更新。

我们提供了`ThemeProvider`来配置主题样式，他是一个组件，接收`theme`作为 prop，你应该把这个组件放在你的 App 组件的最外层，这样你整个应用的所有组件都可以使用主题配置。

```js
import { ThemeProvider, createClasses } from '@bv3/router'

const App = defineComponent({
    setup() {
        const theme = reactive({
            mainColor: 'red',
        })

        return () => (
            <ThemeProvider>
                <YourAppHere />
            </ThemeProvider>
        )
    },
})

const OtherComponent = defineComponent({
    setup() {
        const classesRef = createClasses((theme) => ({
            root: {
                backgroundColor: theme.mainColor,
            },
        }))

        return () => <div class={classesRef.value.root}>My Component</div>
    },
})
```

`createClasses` 的回掉会自动接收主题对象，你可以直接在这里使用主题里面的变量。`ThemeProvider`并不是必须使用的，如果你不使用，默认的`theme`是一个空对象。

# styled

在 React 生态中非常著名的 styledComponent 已经发展地非常成熟，我们使用 emotion 提供了大部分 React 生态中 styled 的使用方式，如果你对于 styled 的使用方式有疑问，你可以看[Emotion styled 的文档](https://emotion.sh/docs/styled)
