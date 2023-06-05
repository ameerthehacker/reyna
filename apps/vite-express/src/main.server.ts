import express from 'express';

const app = express();
const PORT = process.env.SERVER_PORT || 8000;

app.listen(PORT, () => {
  console.log(`express server running at port ${PORT} 🚀`);
});
