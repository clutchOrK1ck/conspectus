import { visit } from 'unist-util-visit'

export default function remarkMathMetaBridge() {
  return function (tree: any) {
    visit(tree, 'math', (node: any) => {
      if (!node.meta) return;
      if (!node.data?.hChildren?.[0]) return;

      const code = node.data.hChildren[0];
      code.properties ||= {};
      code.properties.dataMeta = node.meta;
    })
  }
}