import { IncomingMessage } from 'http'
import https from 'https'
import { Readable, Writable } from 'stream'
import { pipeline } from 'stream/promises'
import { ParallelStream } from './streams'

const get = async (url: string): Promise < IncomingMessage > => {
  return await new Promise((resolve, reject) => {
    https.get(url, (res) => {
      resolve(res)
    }).on('error', (err) => {
      reject(err)
    })
  })
}

export interface Out {
  url: string
  body: Buffer
}

/**
 * fetch a text representation of web resources.
 * @param urls An array of URLs to fetch.
 * @param concurrency number of concurrent fetches.
 */
const parallelWget = async (urls: string[], concurrency = 10, processor: (out: Out) => any): Promise<void> => {
  const urlsStream = Readable.from(urls)
  const parallelRequestStream = new ParallelStream<string, Out>(
    async function (url, _enc, done) {
      try {
        const res = await get(url)
        for await (const chunk of res) {
          await this.pushWithBackPressure({
            url,
            body: chunk
          })
        }
      } catch (err) {
        console.error(err)
      }

      done()
    },
    concurrency,
    undefined
  )

  return await pipeline(
    urlsStream,
    parallelRequestStream,
    new Writable({
      write: (chunk, _enc, done) => {
        processor(chunk)
        done()
      },
      objectMode: true
    })
  )
}

export default parallelWget
