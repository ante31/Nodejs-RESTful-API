import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(
            "mongodb+srv://Ante:A2mt3UTB@cluster.dvnypvh.mongodb.net/mydb",
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            }
        );
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
};

export default connectDB;
