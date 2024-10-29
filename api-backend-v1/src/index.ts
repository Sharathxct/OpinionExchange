import express from 'express';
import { router } from './routes';
const app = express();
app.use(express.json());

// use router
app.use(router)

app.listen(3000, () => {
  console.log("listening at port 3000")
})


// TODO: balance validation, websockets, pub-subs
