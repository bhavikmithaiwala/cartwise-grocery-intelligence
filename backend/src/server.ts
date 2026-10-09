import "dotenv/config";
import { app } from "./app.js";
import { recoverInterruptedOcr } from "./services/ocr.js";

const port = Number(process.env.PORT ?? 3001);
await recoverInterruptedOcr();
app.listen(port, process.env.HOST ?? "127.0.0.1", () =>
  console.log(`CartWise API listening on port ${port}`),
);
