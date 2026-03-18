import { h } from 'hastscript';
import { toText } from 'hast-util-to-text';
import type { Element, Root } from 'hast';
import { mathjax } from '@mathjax/src/js/mathjax.js';
import { AsciiMath } from '@mathjax/src/js/input/asciimath.js';
import { TeX } from '@mathjax/src/js/input/tex.js';
import { SVG } from '@mathjax/src/js/output/svg.js';
import { liteAdaptor } from '@mathjax/src/js/adaptors/liteAdaptor.js';
import { RegisterHTMLHandler } from '@mathjax/src/js/handlers/html.js';
import type { MathDocument } from '@mathjax/src/js/core/MathDocument.js';
import type { LiteElement } from '@mathjax/src/js/adaptors/lite/Element.js';
import { SKIP, visitParents } from 'unist-util-visit-parents';
import type { OptionList } from '@mathjax/src/js/util/Options.js';

type MathLanguage = 'tex' | 'ascii';

/**
 * the meta on the math block: mathLanguage can be one of tex/ascii + treatNewLineAsSeparateMath means that each new line is a new math formula
 */
type Meta = {
    mathLanguage: 'tex' | 'ascii',
    treatNewLineAsSeparateMath: boolean,
    attrs?: Record<string, string> // optional object of key-value attributes
}

function parseMeta(meta: string): Meta {
    const parts = meta
        .split(',')
        .map(p => p.trim())
        .filter(Boolean); // only leave non-empty strings

    const returnMeta: Meta = {
        mathLanguage: parts.includes('tex') ? 'tex' : 'ascii', // ascii is the default mode
        treatNewLineAsSeparateMath: parts.includes('nl'),
    }

    // optional key-value pairs
    const attributes = parts
        .filter(pt => pt.includes('='))
        .map(pt => pt.split('=', 2))
        .map(pts => [pts[0].trim(), pts[1].trim()])
        .filter(pts => pts[0] && pts[1]);

    if (attributes.length) {
        returnMeta.attrs = {};
        for (const [key, value] of attributes) {
            returnMeta.attrs[key] = value;
        }
    }

    return returnMeta;
}

class MathRenderer {
    isInitialized: boolean;
    mathDocument: MathDocument<any, any, any> | null;
    handler: any;

    constructor() {
        this.isInitialized = false;
        this.mathDocument = null;
    }

    init() {
        if (!this.isInitialized) {
            const adaptor = liteAdaptor();
            this.handler = RegisterHTMLHandler(adaptor);
            this.mathDocument = mathjax.document('', {
                InputJax: [
                    new AsciiMath({}),
                    new TeX({})
                ],
                OutputJax: new SVG({ fontCache: 'none' })
            });

            this.isInitialized = true;
        }
    }

    cleanUp() {
        if (this.handler) {
            mathjax.handlers.unregister(this.handler);
        }
    }

    private liteElementToHast(element: LiteElement): any {
        const children = [];

        for (const node of element.children) {
            children.push(
                'value' in node
                    ? {type: 'text', value: node.value}
                    : this.liteElementToHast(node)
            );
        }

        return h(element.kind, element.attributes, children);
    }

    render(math: string, 
        treatNewLineAsSeparateMath: boolean = false,
        options: OptionList = {}): LiteElement[] {
        if (!this.isInitialized) {
            this.init();
        }

        return (treatNewLineAsSeparateMath
                ? math.split('\n').filter(Boolean)
                : [math])
                .map(str => this.mathDocument?.convert(str, options));
    }

    renderAsHast(math: string,
        treatNewLineAsSeparateMath: boolean = false,
        options: OptionList = {}): any[] {
        return this.render(math, treatNewLineAsSeparateMath, options)
            .map(el => this.liteElementToHast(el));
    }

    /**
     * returns stylsheet to include as hast node
     */
    get stylesheet(): Element {
        const node = this.liteElementToHast(this.mathDocument?.outputJax.styleSheet(this.mathDocument));
        
        // ?? this comes from rehype-mathjax upstream
        node.properties.id = undefined
        return node
    }
}

function rehypeMathPlugin(options: any) {
    return function treeWalker(tree: any, file: any) {
        const renderer = new MathRenderer();
        let context = tree;

        visitParents(tree, 'element', function (element: Element, parents: Array<Root | Element>) {
            const classes = Array.isArray(element.properties.className)
                ? element.properties.className
                : [];

            let meta: Meta | undefined;
            if (typeof element.properties.dataMeta === 'string') {
                meta = parseMeta(String(element.properties.dataMeta));
            } else if (classes.includes('math-display')) { // supply default meta for block math with no specifiers
                meta = {
                    mathLanguage: 'ascii',
                    treatNewLineAsSeparateMath: false
                };
            }
            
            if (element.tagName === 'head') {
                context = element;
            }

            if (!classes.some(clsName => ['language-math', 'math-display', 'math-inline'].includes(String(clsName)))) {
                return;
            }

            let parent = parents[parents.length - 1];
            let scope = element;

            if (
                element.tagName === 'code' &&
                classes.includes('language-math') &&
                parent &&
                parent.type === 'element' &&
                parent.tagName === 'pre'
            ) {
                scope = parent;
                parent = parents[parents.length - 2];
            }

            if (!parent) return;

            const text = toText(scope, {whitespace: 'pre'});
            let hNodes;

            try {
                // this returns an 'mjx-container' element containing an SVG, no attributes or style config yet
                hNodes = renderer.renderAsHast(text,
                    meta?.treatNewLineAsSeparateMath ?? false,
                    {
                        format: meta
                            ? (meta.mathLanguage === 'ascii' ? 'AsciiMath' : 'TeX')
                            : (classes.includes('math-inline') ? 'AsciiMath' : 'Tex'),
                        display: classes.includes('math-display')
                    })
                    .map(node => { // this adds attributes required by mathjax-styler to style formulas nicely
                        if (classes.includes('math-display')) {
                            node.properties.display = 'true';
                            node.properties.width = 'full';
                        }
                        if (meta?.attrs) {
                            node.properties = {
                                ...node.properties,
                                ...meta.attrs
                            };
                        }

                        // this fix is for starlight to not apply its markdown-content styling to SVGs (those are styled by mathjax)
                        node.properties.className.push('not-content');

                        return node;
                    });
            } catch (error) {
                hNodes = [
                    {
                        type: 'element',
                        tagName: 'span',
                        properties: {
                            className: ['mathjax-error'],
                            style: 'color:#cc0000',
                            title: String(error)
                        },
                        children: [{type: 'text', value: text}]
                    }
                ];
            }

            const index = parent.children.indexOf(scope);
            parent.children.splice(index, 1, ...hNodes);
            return SKIP;
        });

        if (renderer.isInitialized) {
            context.children.push(renderer.stylesheet); // if renderer was initialized, pushes its stylesheet into the page
        }
        renderer.cleanUp();
    }
}

export default rehypeMathPlugin;