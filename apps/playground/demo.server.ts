import { readFile } from 'fs/promises';

// executed in the backend node server!
// use ORMs to fetch data or use any node APIs you want :)
export async function getDemoFileContent() {
  return await readFile(`${__dirname}/demo.txt`, { encoding: 'utf-8' });
}
