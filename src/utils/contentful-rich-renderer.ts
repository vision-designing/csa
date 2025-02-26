// Type definitions
type BlockType = (typeof RICH_TEXT_BLOCKS)[keyof typeof RICH_TEXT_BLOCKS];
type MarkType = (typeof MARKS)[keyof typeof MARKS];

interface Mark {
  type: MarkType;
}

interface Document {
  nodeType: "document";
  data: Record<string, unknown>;
  content: any[];
}

// 1. Update Node interface to include specific node types
interface BaseNode {
  nodeType: string;
  data: Record<string, unknown>;
  content?: Node[];
  value?: string;
  marks?: Mark[];
}

type Node = TextNode | HyperlinkNode | AssetNode | BlockNode;

interface BlockNode extends BaseNode {
  nodeType: BlockType;
  data: Record<string, unknown>;
  content: Node[];
}

interface TextNode extends BaseNode {
  nodeType: "text";
  value: string;
  marks: Mark[];
  data: Record<string, unknown>;
}

interface HyperlinkNode extends BaseNode {
  nodeType: "hyperlink";
  data: {
    uri: string;
  };
}

interface AssetNode extends BaseNode {
  nodeType: "embedded-asset-block";
  data: {
    target: {
      metadata: {
        tags: string[];
        concepts: string[];
      };
      sys: any;
      fields: {
        title: string;
        description: string;
        file: {
          url: string;
          details: {
            size: number;
            image: {
              width: number;
              height: number;
            };
          };
          fileName: string;
          contentType: string;
        };
      };
    };
  };
}

// Constants
const RICH_TEXT_BLOCKS = {
  PARAGRAPH: "paragraph",
  HEADING_1: "heading-1",
  HEADING_2: "heading-2",
  HEADING_3: "heading-3",
  HEADING_4: "heading-4",
  HEADING_5: "heading-5",
  HEADING_6: "heading-6",
  UL_LIST: "unordered-list",
  OL_LIST: "ordered-list",
  LIST_ITEM: "list-item",
  QUOTE: "blockquote",
  HR: "hr",
  TABLE: "table",
  TABLE_ROW: "table-row",
  TABLE_CELL: "table-cell",
  TABLE_HEADER_CELL: "table-header-cell",
  EMBEDDED_ASSET_BLOCK: "embedded-asset-block",
  HYPERLINK: "hyperlink",
} as const;

const MARKS = {
  BOLD: "bold",
  ITALIC: "italic",
  UNDERLINE: "underline",
  CODE: "code",
  SUPERSCRIPT: "superscript",
  SUBSCRIPT: "subscript",
  STRIKETHROUGH: "strikethrough",
} as const;

// Helper functions
const attributeValue = (value: string): string =>
  `"${value.replace(/"/g, "&quot;")}"`;

// Leaf node type guards
function isTextNode(node: Node): node is TextNode {
  return node.nodeType === "text";
}

function isAssetNode(node: Node): node is AssetNode {
  return node.nodeType === "embedded-asset-block";
}

// 2. Update renderer types
type NodeRenderer<T extends Node = Node> = (
  node: T,
  next: (nodes?: Node[]) => string,
) => string;

// 3. Update defaultNodeRenderers with proper typing
const defaultNodeRenderers: Partial<Record<BlockType, NodeRenderer>> = {
  [RICH_TEXT_BLOCKS.PARAGRAPH]: (node, next) => `<p>${next(node.content)}</p>`,
  [RICH_TEXT_BLOCKS.HEADING_1]: (node, next) =>
    `<h1>${next(node.content)}</h1>`,
  [RICH_TEXT_BLOCKS.HEADING_2]: (node, next) =>
    `<h2>${next(node.content)}</h2>`,
  [RICH_TEXT_BLOCKS.HEADING_3]: (node, next) =>
    `<h3>${next(node.content)}</h3>`,
  [RICH_TEXT_BLOCKS.HEADING_4]: (node, next) =>
    `<h4>${next(node.content)}</h4>`,
  [RICH_TEXT_BLOCKS.HEADING_5]: (node, next) =>
    `<h5>${next(node.content)}</h5>`,
  [RICH_TEXT_BLOCKS.HEADING_6]: (node, next) =>
    `<h6>${next(node.content)}</h6>`,
  [RICH_TEXT_BLOCKS.UL_LIST]: (node, next) => `<ul>${next(node.content)}</ul>`,
  [RICH_TEXT_BLOCKS.OL_LIST]: (node, next) => `<ol>${next(node.content)}</ol>`,
  [RICH_TEXT_BLOCKS.LIST_ITEM]: (node, next) =>
    `<li>${next(node.content)}</li>`,
  [RICH_TEXT_BLOCKS.QUOTE]: (node, next) =>
    `<blockquote>${next(node.content)}</blockquote>`,
  [RICH_TEXT_BLOCKS.HR]: () => "<hr/>",
  [RICH_TEXT_BLOCKS.TABLE]: (node, next) =>
    `<table>${next(node.content)}</table>`,
  [RICH_TEXT_BLOCKS.TABLE_ROW]: (node, next) =>
    `<tr>${next(node.content)}</tr>`,
  [RICH_TEXT_BLOCKS.TABLE_HEADER_CELL]: (node, next) =>
    `<th>${next(node.content)}</th>`,
  [RICH_TEXT_BLOCKS.TABLE_CELL]: (node, next) =>
    `<td>${next(node.content)}</td>`,
  [RICH_TEXT_BLOCKS.HYPERLINK]: ((node: HyperlinkNode, next) => {
    const href = node.data.uri;
    return `<a href=${attributeValue(href)}>${next(node.content)}</a>`;
  }) as NodeRenderer,
};

const defaultMarkRenderers: Record<MarkType, (text: string) => string> = {
  [MARKS.BOLD]: (text) => `<strong>${text}</strong>`,
  [MARKS.ITALIC]: (text) => `<i>${text}</i>`,
  [MARKS.UNDERLINE]: (text) => `<u>${text}</u>`,
  [MARKS.CODE]: (text) => `<code>${text}</code>`,
  [MARKS.SUPERSCRIPT]: (text) => `<sup>${text}</sup>`,
  [MARKS.SUBSCRIPT]: (text) => `<sub>${text}</sub>`,
  [MARKS.STRIKETHROUGH]: (text) => `<s>${text}</s>`,
};

export function documentToHtmlString(document: Document): string {
  if (!document?.content) return "";
  return nodeListToHtmlString(document.content);
}

function nodeListToHtmlString(nodes: Node[] = []): string {
  return nodes.map((node) => nodeToHtmlString(node)).join("");
}

function nodeToHtmlString(node: Node): string {
  if (isTextNode(node)) {
    if (!node.value) return "";

    if (node.marks.length) {
      return node.marks.reduce((value: string, mark: Mark) => {
        const renderer = defaultMarkRenderers[mark.type];
        return renderer ? renderer(value) : value;
      }, node.value);
    }

    return node.value;
  }

  if (isAssetNode(node)) {
    const assetNode = node;
    const url = `https:${assetNode.data.target.fields.file.url}`;
    const alt =
      assetNode.data.target.fields.description ||
      assetNode.data.target.fields.title;
    return `<img src=${attributeValue(url)} alt=${attributeValue(alt)}>`;
  }

  const renderer = defaultNodeRenderers[node.nodeType];
  if (!renderer) return "";

  return renderer(node, nodeListToHtmlString);
}
