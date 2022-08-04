import stream from 'stream'

type TransformFn <In, Out> = (this: ParallelStream<In, Out>, chunk: In, enc: string, done: () => void) => Promise<void>

export class ParallelStream < In, Out > extends stream.Transform {
  private running: number
  private terminate: (() => void) | null
  private readonly transformFn: TransformFn <In, Out>
  private readonly concurrency: number
  private continue: (() => void) | null

  constructor (transformFn: TransformFn <In, Out>, concurrency: number, opts: stream.TransformOptions | undefined) {
    super({
      objectMode: true,
      ...opts
    })
    this.transformFn = transformFn
    this.running = 0
    this.concurrency = concurrency
    this.terminate = null
    this.continue = null
  }

  _transform (chunk: In, enc: string, done: () => void): void {
    this.running++
    void this.transformFn(
      chunk,
      enc,
      this._onComplete.bind(this)
    )

    if (this.concurrency <= this.running) {
      this.continue = done
      return
    }

    done()
  }

  pushWithBackPressure (chunk: any): Promise<unknown> | undefined {
    const shouldContinue = this.push(chunk)
    if (!shouldContinue) {
      return new Promise((resolve, reject) => {
        this.once('drain', resolve)
      })
    }
  }

  _flush (done: () => void): void {
    if (this.running > 0) {
      this.terminate = done
    } else {
      done()
    }
  }

  _onComplete (err: Error): boolean | undefined {
    this.running--
    if (err) {
      return this.emit('error', err)
    }
    const continueTmp = this.continue
    this.continue = null
    continueTmp?.()

    if (this.running === 0) {
      this.terminate?.()
    }
  }
}
