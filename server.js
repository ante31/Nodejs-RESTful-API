import User from "./models/UserSchema.js";
import Post from "./models/PostSchema.js";
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

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         content:
 *           type: string
 *     UserRegister:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *     UserLogin:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 *
 * /register:
 *   post:
 *     summary: Register
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegister'
 *     responses:
 *       '200':
 *         description: User registered successfully
 *       '406':
 *         description: User already logged in
 *       '409':
 *         description: User already exists
 *       '422':
 *         description: Invalid email format
 *       '500':
 *         description: Internal server error
 *
 * /login:
 *   post:
 *     summary: Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       '200':
 *         description: User successfully logged in
 *       '401':
 *         description: Wrong Username and Password Combination
 *       '404':
 *         description: User not found
 *       '406':
 *         description: User already logged in
 *       '500':
 *         description: Internal server error
 *
 * /users:
 *   get:
 *     summary: Get all users
 *     responses:
 *       '200':
 *         description: Success
 *       '401':
 *         description: Access token not found
 *       '403':
 *         description: User is not authorized
 *       '498':
 *         description: Invalid access token
 *       '500':
 *         description: Internal server error
 *
 * /post-request:
 *   get:
 *     summary: Get all post requests
 *     responses:
 *       '200':
 *         description: Success
 *       '401':
 *         description: Access token not found
 *       '403':
 *         description: User is not authorized
 *       '498':
 *         description: Invalid access token
 *       '500':
 *         description: Internal server error
 *   post:
 *     summary: Allow or decline a post (admin only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: string
 *               allowed:
 *                 type: string
 *                 enum: [allowed, declined]
 *     responses:
 *       '403':
 *         description: Unauthorized access
 *       '404':
 *         description: Post not found
 *       '422':
 *         description: Invalid data
 *       '498':
 *         description: Invalid access token
 *       '500':
 *         description: Internal server error
 *
 * /posts:
 *   get:
 *     summary: Get all posts
 *     responses:
 *       '200':
 *         description: Success
 *       '204':
 *         description: No posts
 *       '500':
 *         description: Internal server error
 *   post:
 *     summary: Create a new post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       '200':
 *         description: Post created successfully
 *       '401':
 *         description: Unauthenticated user
 *       '498':
 *         description: Invalid access token
 *       '500':
 *         description: Internal server error
 *
 * /logout:
 *   post:
 *     summary: Log out
 *     responses:
 *       '200':
 *         description: Successful logout
 *       '400':
 *         description: No access token found
 */

// Start server
app.listen(5000, () =>
    console.log("Server listening at http://localhost:5000")
);
