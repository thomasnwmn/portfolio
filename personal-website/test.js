const { Client } = require('@notionhq/client');
const { NotionToMarkdown } = require('notion-to-md');
const notion = new Client({ auth: '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' });
const n2m = new NotionToMarkdown({ notionClient: notion });
async function test() {
  const blocks = await n2m.pageToMarkdown('3de9e5f54f5580db9a09d982562c1419');
  const str = n2m.toMarkdownString(blocks);
  console.log(typeof str);
  console.log(str);
  console.log(str.parent);
}
test();
