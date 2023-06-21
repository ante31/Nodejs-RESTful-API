import mongoose from "mongoose";

const { Schema } = mongoose;

const postSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    allowed: {
        type: String,
        enum: ["requested", "allowed", "declined"],
        default: "requested",
    },
});

const Post = mongoose.model("Post", postSchema);

export default Post;
