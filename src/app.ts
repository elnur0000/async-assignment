import parallelWget, { Out } from './parallel-wget'

void (async () => {
  try {
    const urls = ['https://example-files.online-convert.com/document/txt/example.txt', 'https://raw.githubusercontent.com/danielmiessler/SecLists/master/Discovery/DNS/deepmagic.com-prefixes-top500.txt']
    await parallelWget(urls, 5, (out: Out) => {
      console.log(out.body.toString())
    })
  } catch (e) {
    console.error(e)
  }
})()
