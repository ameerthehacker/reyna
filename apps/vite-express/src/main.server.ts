import { reyna } from '@reyna/express';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.SERVER_PORT || 8000;

app.use(express.json());
app.use(cors());
app.use(reyna);

app.listen(PORT, () => {
  console.log(`express server running at port ${PORT} 🚀`);
});
