const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const varifyToken = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }

  // verify the token
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;

    next();
  });
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.kbm4w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const database = client.db("TechTrails");
    const usersCollection = database.collection("users");
    const blogsCollection = database.collection("blogs");
    const commentCollection = database.collection("comment");

    // auth related APIs
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "5h",
      });

      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false,
        })
        .send({ success: true });
    });

    app.post("/logout", (req, res) => {
      res
        .clearCookie("token", {
          httpOnly: true,
          secure: false,
        })
        .send({ success: true });
    });

    // all get
    app.get("/users", varifyToken, async (req, res) => {
      const email = req.query.email;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      if (req.user.email !== req.query.email) {
        // token email !== query email
        return res.status(403).send({ message: "forbidden access" });
      }

      try {
        const query = { email: email };
        const user = await usersCollection.findOne(query);

        if (user) {
          res.json(user);
        } else {
          res.status(404).json({ error: "User not found" });
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.get("/blogs", async (req, res) => {
      try {
        const blogs = await blogsCollection.find().toArray();
        res.json(blogs);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.get("/recentblogs", async (req, res) => {
      try {
        const cursor = blogsCollection.find().sort({ date: -1 }).limit(6);
        const blogs = await cursor.toArray();
        res.send(blogs);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.get("/featuredblogs", async (req, res) => {
      try {
        const cursor = blogsCollection.find({ featured: true });
        const blogs = await cursor.toArray();
        res.send(blogs);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // according to blog id
    app.get("/blog/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const blog = await blogsCollection.findOne(query);

        res.send(blog);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // to get all wish list from user collection
    app.get("/wishlist", async (req, res) => {
      const email = req.query.email;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      try {
        const user = await usersCollection.findOne({ email: email });

        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        const wishlist = user.wishlist || [];

        const blogs = await blogsCollection
          .find({
            _id: {
              $in: wishlist.map((id) => new ObjectId(id)),
            },
          })
          .toArray();

        res.json(blogs);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Get comments for a specific blog ID
    app.get("/comment", async (req, res) => {
      const blogId = req.query.blogId; // Get the blog ID from query parameters

      if (!blogId) {
        return res.status(400).json({ error: "Blog ID is required" });
      }

      try {
        // Find the comments for the specified blog ID
        const comments = await commentCollection.findOne({ blogId });

        if (comments) {
          res.json(comments.commentList); // Return the commentList if found
        } else {
          res.status(404).json({ error: "No comments found for this blog" });
        }
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // all post
    // user date
    app.post("/users", async (req, res) => {
      try {
        const newUser = req.body;

        const findUser = await usersCollection.findOne({
          email: newUser.email,
        });
        if (findUser) {
          return res.status(400).json({ error: "User already exists" });
        } else {
          const result = await usersCollection.insertOne(newUser);
          res.send(result);
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.post("/blogs", async (req, res) => {
      try {
        const newBlog = req.body;
        const result = await blogsCollection.insertOne(newBlog);
        res.send(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // post comment
    app.post("/comment", async (req, res) => {
      try {
        const newComment = req.body;

        const blogId = newComment.blogId;
        const formatedComment = {
          userId: newComment.userId,
          userName: newComment.userName,
          userImg: newComment.userImg,
          comment: newComment.comment,
        };

        const findBlog = await commentCollection.findOne({ blogId });

        if (!findBlog) {
          const result = await commentCollection.insertOne({
            blogId,
            commentList: [formatedComment],
          });
          res.status(201).json({
            message: "Comment added successfully",
            id: result.insertedId,
          });
        } else {
          const result = await commentCollection.updateOne(
            { blogId },
            {
              $push: {
                commentList: formatedComment,
              },
            }
          );
          res.json({ message: "Comment appended successfully" });
        }
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // All patch
    app.patch("/wishlist", async (req, res) => {
      const data = req.body;
      const email = data.email;
      const _id = data._id;

      try {
        const query = { email: email };
        const updateDoc = {
          $addToSet: { wishlist: _id },
        };

        const result = await usersCollection.updateOne(query, updateDoc);

        if (result.modifiedCount > 0) {
          res.json({ message: "Wishlist updated successfully" });
        } else {
          res
            .status(404)
            .json({ error: "User not found or wishlist not updated" });
        }
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Blog server is running");
});

app.listen(port, () => {
  console.log(`Server is running on PORT: ${port}`);
});
