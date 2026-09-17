const { Client } = require('@notionhq/client');
const notion = new Client({ auth: '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' });
async function test() {
  try {
    const res = await notion.databases.query({
      database_id: '3de9e5f54f55804ca6cfc525190787cd'
    });
    console.log('SUCCESS! Got', res.results.length, 'results.');
  } catch(e) {
    console.error('ERROR:', e.message);
  }
}
test();
