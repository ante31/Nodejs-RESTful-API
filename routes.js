import express from "express";
import bcrypt from "bcryptjs";
import { createTokens, validateToken, checkAuthorization } from "./JWT.js";
import User from "./models/UserSchema.js";
import Post from "./models/PostSchema.js";

const emailRegex = /^\S+@\S+\.\S+$/;

const router = express.Router();

router.get("/posts", validateToken, async (req, res) => {
    try {
        let posts;

        if (req.userRole === "BLOGGER") {
            // Bloggers can only see posts they created
            posts = await Post.find({ author: req.userId });
        } else if (req.userRole === "ADMIN") {
            // Admins can see all posts
            posts = await Post.find();
        } else {
            // Unauthenticated users can only see public posts
            // and authenticated
            posts = await Post.find({ allowed: "allowed" });
        }

        if (posts.length === 0) {
            res.sendStatus(204).json({ message: "No content" });
        } else {
            res.status(200).json(posts);
        }
    } catch (error) {
        res.status(500).json({ error: error });
    }
});

router.get("/users", validateToken, checkAuthorization, async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

router.post("/posts", validateToken, async (req, res) => {
    try {
        if (!req.authenticated) {
            return res.status(401).json({ error: "Unauthenticated user" });
        }

        const { title, content } = req.body;
        const userId = req.userId;
        const userRole = req.userRole;

        let allowed = "requested";

        if (userRole === "ADMIN") {
            allowed = "allowed";
        }

        const post = new Post({
            title,
            content,
            timestamp: new Date(),
            author: userId,
            allowed,
        });

        await post.save();

        res.status(200).json({
            message: "Post successfully created.",
        });
    } catch (error) {
        console.error("Error creating post:", error.message);
        res.status(500).json({ error: "Failed to create post" });
    }
});

router.post(
    "/post-request",
    validateToken,
    checkAuthorization,
    async (req, res) => {
        try {
            const { postId, allowed } = req.body;

            if (allowed !== "allowed" && allowed !== "declined") {
                return res.status(422).json({ error: "Invalid allowed value" });
            }

            if (postId.length !== 24) {
                return res.status(422).json({ error: "Invalid postId format" });
            }

            const post = await Post.findById(postId);

            if (!post) {
                return res.status(404).json({ error: "Post not found" });
            }

            const updatedPost = await Post.findByIdAndUpdate(
                postId,
                { allowed },
                { new: true }
            );

            // Update the author's role if the post is allowed
            if (allowed === "allowed") {
                const authorId = updatedPost.author;
                await User.findByIdAndUpdate(authorId, { role: "BLOGGER" });
            }

            res.status(200).json({
                message: "Post status updated successfully",
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

router.get(
    "/post-request",
    validateToken,
    checkAuthorization,
    async (req, res) => {
        try {
            const userRole = req.userRole;

            if (userRole === "ADMIN") {
                // Fetch post requests
                const postRequests = await Post.find({ allowed: "requested" });

                res.status(200).json(postRequests);
            } else {
                res.status(403).json({ error: "User is not authorized." });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

router.post("/register", async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    const newPassword = bcrypt.hashSync(password);
    const role = "USER";

    try {
        // Check if user is already logged in
        if (req.cookies["access-token"]) {
            return res.status(406).json({
                message: "User is already logged in.",
            });
        }

        // Check if the email is valid
        if (!emailRegex.test(email)) {
            return res.status(422).send({ message: "Invalid email format." });
        }

        // Check if the user already exists in the database
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).send({ message: "User already exists." });
        }

        // Create a new user object with the email and password
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: newPassword,
            role,
        });

        // Save the user object to the MongoDB database
        const user = await newUser.save();
        const accessToken = createTokens(user);
        res.cookie("access-token", accessToken, {
            maxAge: 60 * 60 * 24 * 1000, // 24 hours
        });
        res.status(200).send({ message: "User registered successfully." });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Check if user is already logged in
    if (req.cookies["access-token"]) {
        return res.status(406).json({
            message: "User is already logged in.",
        });
    }

    User.findOne({ email: email }).then((user) => {
        if (!user) {
            res.status(404).json({ message: "User not found." });
        } else {
            const dbPassword = user.password;
            bcrypt.compare(password, dbPassword).then((match) => {
                if (!match) {
                    res.status(401).json({
                        message: "Wrong Username and Password Combination!",
                    });
                } else {
                    const accessToken = createTokens(user);
                    res.cookie("access-token", accessToken, {
                        maxAge: 60 * 60 * 24 * 1000,
                    });
                    res.status(200).json({
                        message: "Logged in successfully.",
                    });
                }
            });
        }
    });
});

router.post("/logout", (req, res) => {
    if (!req.cookies["access-token"]) {
        return res.status(400).json({ error: "No access token found." });
    }

    res.clearCookie("access-token");
    res.status(200).json({ message: "Logged out successfully." });
});

export default router;
