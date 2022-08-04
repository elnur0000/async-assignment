import parallelWget, { Out } from './parallel-wget'
import nock from 'nock'
import crypto from 'crypto'

afterEach(() => {
  nock.cleanAll()
})

const generateStr = (length: number): string => {
  return crypto.randomBytes(length).toString('hex')
}

test('should fetch valid resources', async () => {
  const testCount = 10
  const requestUrlToBody = {}
  for (let i = 0; i < testCount; i++) {
    const url = `https://example.com/${i}`
    const body = generateStr(10000)
    requestUrlToBody[url] = body

    nock(url).get('').reply(200, body)
  }

  const responseUrlToBody: {[key: string]: string} = {}

  await parallelWget(Object.keys(requestUrlToBody), 5, (out: Out) => {
    if (!responseUrlToBody[out.url]) {
      responseUrlToBody[out.url] = ''
    }

    responseUrlToBody[out.url] += out.body.toString()
  })

  expect(responseUrlToBody).toEqual(requestUrlToBody)
})
