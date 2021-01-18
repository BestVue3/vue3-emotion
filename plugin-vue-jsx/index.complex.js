// @ts-check
const babel = require('@babel/core')
const jsx = require('@vue/babel-plugin-jsx')
const importMeta = require('@babel/plugin-syntax-import-meta')
const hash = require('hash-sum')

/**
 * @param {import('.').Options} options
 * @returns {import('vite').Plugin}
 */
function vueJsxPlugin(options = {}) {
    let needHmr = false
    let needSourceMap = true

    return {
        name: 'vue-jsx',

        config(config) {
            return {
                // only apply esbuild to ts files
                // since we are handling jsx and tsx now
                esbuild: {
                    include: /\.ts$/,
                },
                define: {
                    __VUE_OPTIONS_API__: true,
                    __VUE_PROD_DEVTOOLS__: false,
                    ...config.define,
                },
            }
        },

        configResolved(config) {
            needHmr = config.command === 'serve' && !config.isProduction
            needSourceMap =
                config.command === 'serve' || !!config.build.sourcemap
        },

        transform(code, id) {
            if (/\.[jt]sx$/.test(id)) {
                const plugins = [importMeta, [jsx, options]]
                if (id.endsWith('.tsx')) {
                    plugins.push([
                        require('@babel/plugin-transform-typescript'),
                        // @ts-ignore
                        { isTSX: true, allowExtensions: true },
                    ])
                }

                const result = babel.transformSync(code, {
                    ast: true,
                    plugins,
                    sourceMaps: needSourceMap,
                    sourceFileName: id,
                })

                if (!needHmr) {
                    return {
                        code: result.code,
                        map: result.map,
                    }
                }

                // check for hmr injection
                /**
                 * @type {{ name: string, hash: string }[]}
                 */
                const declaredComponents = []
                /**
                 * @type {{
                 *  local: string,
                 *  exported: string,
                 *  id: string,
                 *  hash: string
                 * }[]}
                 */
                const hotComponents = []
                let hasDefault = false

                /**
                 * @type {{
                 *  name: string
                 *  hash: string
                 *  isComponent: boolean
                 *  id: string
                 *  exported: boolean
                 * }[]}
                 */
                const declarations = []

                for (const node of result.ast.program.body) {
                    if (node.type === 'VariableDeclaration') {
                        const names = parseDecls(node, code)
                        if (names.length) {
                            // declaredComponents.push(...names)
                            declarations.push(
                                ...names.map((n) => ({
                                    ...n,
                                    id: hash(id + n.name),
                                    exported: false,
                                })),
                            )
                        }
                    }

                    if (node.type === 'FunctionDeclaration') {
                        const codeHash = parseCodeHash(
                            code,
                            node.body.start,
                            node.body.end,
                        )
                        declarations.push({
                            name: node.id.name,
                            hash: codeHash,
                            isComponent: false,
                            id: hash(id + node.id.name),
                            exported: false,
                        })
                    }

                    if (node.type === 'ExportNamedDeclaration') {
                        if (
                            node.declaration &&
                            node.declaration.type === 'VariableDeclaration'
                        ) {
                            declarations.push(
                                ...parseDecls(node.declaration, code).map(
                                    ({ name, hash: _hash, isComponent }) => ({
                                        name,
                                        isComponent,
                                        id: hash(id + name),
                                        hash: _hash,
                                        exported: true,
                                    }),
                                ),
                            )
                        } else if (node.specifiers.length) {
                            for (const spec of node.specifiers) {
                                if (
                                    spec.type === 'ExportSpecifier' &&
                                    spec.exported.type === 'Identifier'
                                ) {
                                    const matched = declarations.find(
                                        ({ name }) => name === spec.local.name,
                                    )
                                    if (matched) {
                                        matched.exported = true
                                    }
                                }
                            }
                        }
                    }

                    if (node.type === 'ExportDefaultDeclaration') {
                        if (node.declaration.type === 'Identifier') {
                            const _name = node.declaration.name
                            const matched = declarations.find(
                                ({ name }) => name === _name,
                            )
                            if (matched) {
                                matched.exported = true
                            }
                        } else if (isDefineComponentCall(node.declaration)) {
                            hasDefault = true
                            declarations.push({
                                name: '__default__',
                                id: hash(id + 'default'),
                                exported: true,
                                isComponent: true,
                                hash: hash(
                                    code.slice(
                                        node.declaration.start,
                                        node.declaration.end,
                                    ),
                                ),
                            })
                        }
                    }
                }

                if (declarations.length) {
                    let code = result.code

                    if (hasDefault) {
                        code =
                            code.replace(
                                /export default defineComponent/g,
                                `const __default__ = defineComponent`,
                            ) + `\nexport default __default__`
                    }

                    code +=
                        `\n const __idHashMap__ = (window.__idHashMap__ = window.__idHashMap__ || {})` +
                        `\n const __localIdHashMap__ = (__idHashMap__["${id}"] = __idHashMap__["${id}"] || {})` +
                        `\nlet __shouldHotAccept__ = true` +
                        `\nconst __hotComponents__ = []`

                    // let callbackCode = ``
                    for (const {
                        name,
                        id,
                        hash,
                        isComponent,
                        exported,
                    } of declarations) {
                        code +=
                            `\n// ${name}` +
                            `\n${isComponent} && __VUE_HMR_RUNTIME__.createRecord("${id}", ${name})` +
                            `\nif (__localIdHashMap__["${id}"] !== "${hash}" && "${name}" !== "_isSlot") {` +
                            `\n  if (${isComponent}) {` +
                            `\n    console.log(${name})` +
                            `\n    ${name}.__hmrId = "${id}"` +
                            // `\n    __hotComponents__.push(["${id}", ${name}])` +
                            `\n    __VUE_HMR_RUNTIME__.reload("${id}", ${name})` +
                            '\n  } else {' +
                            `\n    __shouldHotAccept__ = false` +
                            `\n  }` +
                            `\n  __localIdHashMap__["${id}"] = "${hash}"` +
                            `\n}`
                    }

                    code +=
                        `\nconsole.log(__shouldHotAccept__, __localIdHashMap__, __hotComponents__, import.meta.hot);` +
                        `\nimport.meta.hot.dispose(() => { console.log('...') })`
                    // `\nelse import.meta.hot.dispose()`

                    // `\nimport.meta.hot.accept(({${hotComponents
                    //     .map((c) => `${c.exported}: __${c.exported}`)
                    //     .join(',')}}) => {${callbackCode}\n})`

                    result.code = code
                }

                return {
                    code: result.code,
                    map: result.map,
                }
            }
        },
    }
}

/**
 * @param {import('@babel/core').types.VariableDeclaration} node
 * @param {string} source
 */
function parseDecls(node, source) {
    const names = []
    for (const decl of node.declarations) {
        if (decl.id.type === 'Identifier') {
            names.push({
                name: decl.id.name,
                hash: parseCodeHash(source, decl.init.start, decl.init.end),
                isComponent: isDefineComponentCall(decl.init),
            })
        }
    }
    return names
}

/**
 * @param {string} code
 * @param {number} start
 * @param {number} end
 */
function parseCodeHash(code, start, end) {
    return hash(code.slice(start, end))
}

/**
 * @param {import('@babel/core').types.Node} node
 */
function isDefineComponentCall(node) {
    return (
        node.type === 'CallExpression' &&
        node.callee.type === 'Identifier' &&
        node.callee.name === 'defineComponent'
    )
}

module.exports = vueJsxPlugin
vueJsxPlugin.default = vueJsxPlugin
