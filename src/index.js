import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import connectDB from "./db/index.js";
import { app } from "./app.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`⚙️  Server is running at port : ${process.env.PORT || 8000}`);
    });
    app.on("error", (error) => {
      console.error("Server failed to listen :: ", error);
      throw error;
    });
  })
  .catch((error) => console.error("MONGODB Connection Failed :: ", error));
