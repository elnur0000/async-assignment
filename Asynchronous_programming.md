# Asynchronous programming

Design a component (a `function` or a `class`) that accepts an array of URLs and allows to fetch multiple resources in parallel, returning their `.text` representation. Provide a parameter so that the caller can limit the number of concurrent fetches run in parallel. A minimal interface for such a component could be the following

```tsx
async function runInParallel (urls: string[], concurrency: number): Promise<string[]> {
  // ...
}
```


Important questions to consider:

- How would you test the solution?
- Is the solution able to cover any possible cases?
- Is it optimal?
