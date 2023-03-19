import app from "./app.js";
import dotenv from "dotenv";
import { router } from "./routes/api.js";

dotenv.config();
const { PORT: port = 3000 } = process.env;

// Move the router middleware after session and passport middleware
app.use(router);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
