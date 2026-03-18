---
title: Writing math
description: On writing math formulas in this documentation
---

Both [AsciiMath](https://asciimath.org/) and Tex are supported in this documentation. The default is AsciiMath. This markdown:

```markdown
$$
E = mc^2
$$
```

will be rendered as a centered display formula:

$$
E = mc^2
$$

You can specify formulas written in TeX as follows:

```markdown
$$ tex
    \frac{x}{5} = 2y
$$
```

which will be rendered as follows:

$$ tex
    \frac{x}{5} = 2y
$$

Inline math is supported, too, and defaults to AsciiMath. This will work:

```markdown
Circle radius is related to its circumference according to formula $ r = C/(2pi) $
```

and will be rendered as follows:

Circle radius is related to its circumference according to formula $ r = C/(2pi) $

AsciiMath also understands certain TeX constructs, so this will work, too:

```markdown
Circle radius is related to its circumference according to formula $ r = \frac{C}{2\pi} $
```

results in:

Circle radius is related to its circumference according to formula $ r = \frac{C}{2\pi} $

## Justification

You can justify block math:

```markdown
$$ justify = left
E = mc^2
$$
```

will be rendered on the left (similar with right):

$$ justify = left
E = mc^2
$$

## Scrolling behavior

For extra long formulas, scrolling behavior might be implemented like this:

```markdown
$$ width = null, overflow = scroll, tex
\int_{0}^{\infty}\frac{\sqrt{x^{2}+1}\,\left(\sum_{n=1}^{20}\frac{\sin(nx)+\cos(nx)}{n^{2}+x^{2}}\right)\,\left(\prod_{k=1}^{12}\frac{x^{2}+k^{2}}{x^{2}+k+\frac12}\right)}{\left(1+\frac{x^{2}}{2}+\frac{x^{4}}{3}+\frac{x^{6}}{4}+\frac{x^{8}}{5}\right)\left(\sqrt[3]{x+1}+\sqrt[5]{x+2}+\ln(x+3)+e^{-x/7}\right)}\,dx+\sum_{m=1}^{25}\frac{\left(\frac{m^{2}+3m+1}{m^{3}+1}\right)^{2}\left(\sqrt{m+1}+\sqrt[3]{m+2}+\frac{1}{m+4}\right)}{\left(1+\frac{1}{m}\right)\left(1+\frac{1}{m^{2}}\right)\left(1+\frac{1}{m^{3}}\right)}=\prod_{r=2}^{18}\left(1+\frac{1}{r^{2}}+\frac{1}{r^{3}}+\frac{1}{r^{4}}\right)
$$
```

will render a math formula that can be horizontally scrolled:

$$ width = null, overflow = scroll, tex
\int_{0}^{\infty}\frac{\sqrt{x^{2}+1}\,\left(\sum_{n=1}^{20}\frac{\sin(nx)+\cos(nx)}{n^{2}+x^{2}}\right)\,\left(\prod_{k=1}^{12}\frac{x^{2}+k^{2}}{x^{2}+k+\frac12}\right)}{\left(1+\frac{x^{2}}{2}+\frac{x^{4}}{3}+\frac{x^{6}}{4}+\frac{x^{8}}{5}\right)\left(\sqrt[3]{x+1}+\sqrt[5]{x+2}+\ln(x+3)+e^{-x/7}\right)}\,dx+\sum_{m=1}^{25}\frac{\left(\frac{m^{2}+3m+1}{m^{3}+1}\right)^{2}\left(\sqrt{m+1}+\sqrt[3]{m+2}+\frac{1}{m+4}\right)}{\left(1+\frac{1}{m}\right)\left(1+\frac{1}{m^{2}}\right)\left(1+\frac{1}{m^{3}}\right)}=\prod_{r=2}^{18}\left(1+\frac{1}{r^{2}}+\frac{1}{r^{3}}+\frac{1}{r^{4}}\right)
$$

Note that the other possible value for 'overflow' would be 'truncate' but this is of little use.

## Line break treatment

Note that line breaks can be treated as separate new lines when rendered. Normally math like this:

```markdown
$$
    tan(x) = sin(x) / cos(x)
    cot(x) = cos(x) / sin(x)
$$
```

would be rendered like this:

$$
    tan(x) = sin(x) / cos(x)
    cot(x) = cos(x) / sin(x)
$$

but you can force it render on separate lines using the 'nl' option:

```markdown
$$ nl
    tan(x) = sin(x) / cos(x)
    cot(x) = cos(x) / sin(x)
$$
```

which will place the formulas on separate lines:

$$ nl
    tan(x) = sin(x) / cos(x)
    cot(x) = cos(x) / sin(x)
$$

This is useful when authoring cheat-sheets or problem solutions - this way you don't have to fence every equation in the ```$``` signs.

## Technical note

This functionality is enabled by a custom ```rehype``` plugin and a custom ```remark``` plugin. You can read source code in */src/plugins/rehype-math/rehypeMath.ts* and */src/plugins/remark-preserve-meta/remarkPreserverMeta.ts*. In the compiled output, the math formulas will be represented as ```mjx-container``` elements with ```svg``` inside:

```html
<mjx-container class="MathJax not-content" jax="SVG" overflow="overflow" display="true" width="full"><svg ...>...</svg></mjx-container>
```

Some of the meta defined after the `$` fences will directly become attributes of the `mjx-container`. For example, `justify = right` meta will become an attribute of `mjx-container`. Other meta, like `nl` is used at the `rehype` processing stage. Passing attributes like `justify` to `mjx-container` helps style them properly. Styles are defined entirely by MathJax and Starlight.