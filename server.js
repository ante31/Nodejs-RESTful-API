import express from "express";
import swaggerUI from "swagger-ui-express";
import cookieParser from "cookie-parser";
import swaggerDocs from "./swagger.js";
import connectDB from "./database.js";
import router from "./routes.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.use(router);

// Start server
app.listen(5000, () =>
    console.log("Server listening at http://localhost:5000")
);
