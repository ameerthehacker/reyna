import { reyna } from '@reyna/express';
import express from 'express';
import cors from 'cors';
import path from 'path';

const isDev = process.env.NODE_ENV === 'development';
const app = express();
const PORT = process.env.SERVER_PORT || 8000;

if (!isDev) {
  app.use(express.static(path.resolve(__dirname, '..')));
}

app.use(express.json());
app.use(cors());
app.use(reyna);

app.listen(PORT, () => {
  console.log(`express server running at port ${PORT} 🚀`);
});
