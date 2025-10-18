// const express = require("express");
// const router = express.Router();
// const Blog = require("../models/blog");
// const { ensureAuthenticated } = require("../middleware/auth");

// // Middleware to check if logged in
// // function ensureAuthenticated(req, res, next) {
// //   if (req.isAuthenticated()) return next();
// //   res.redirect("/login");
// // }

// // Get all blogs (public)
// router.get("/", async (req, res) => {
//   const blogs = await Blog.find().populate("author", "username");
//   res.send(blogs);
// });

// // Create a new blog (login required)
// router.post("/new", ensureAuthenticated, async (req, res) => {
//   await Blog.create({
//     title: req.body.title,
//     content: req.body.content,
//     author: req.user._id,
//   });
//   res.send("✅ Blog created");
// });

// module.exports = router;
const express = require("express");
const router = express.Router();
const Blog = require("../models/blog");
const { ensureAuthenticated } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
// const { storage } = require("../config/cloudinary");
// const upload = multer({ storage });

// 🏠 Show all blogs (Home Page)
router.get("/", async (req, res) => {
  const blogs = await Blog.find().populate("author", "username").sort({ createdAt: -1 });
  res.render("home", { title: "All Blogs", blogs, user: req.user });
});

// 📝 Show form to create new blog
router.get("/new", ensureAuthenticated, (req, res) => {
  res.render("createBlog", { title: "Create Blog", user: req.user });
});

// ➕ Create new blog
router.post("/new", ensureAuthenticated,async (req, res) => {
  const imageUrl = req.file ? req.file.path : null;
  await Blog.create({
    title: req.body.title,
    content: req.body.content,
    author: req.user._id,
  });
  req.flash("success_msg", "Blog created successfully!");
  res.redirect("/blogs");
});

// 👁️ View single blog
router.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate("author", "username");
  if (!blog) return res.status(404).send("Blog not found");
  res.render("viewBlog", { title: blog.title, blog, user: req.user });
});

// ✏️ Edit blog form
router.get("/:id/edit", ensureAuthenticated, async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.status(404).send("Blog not found");

  // only allow if owner
  if (blog.author.toString() !== req.user._id.toString()) {
    req.flash("error_msg", "Not authorized");
    return res.redirect("/blogs");
  }

  res.render("createBlog", { title: "Edit Blog", blog, user: req.user }); // reuse create form
});

// 💾 Update blog
router.put("/:id", ensureAuthenticated, async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.status(404).send("Blog not found");

  if (blog.author.toString() !== req.user._id.toString()) {
    req.flash("error_msg", "Not authorized");
    return res.redirect("/blogs");
  }

  blog.title = req.body.title;
  blog.content = req.body.content;
  await blog.save();

  req.flash("success_msg", "Blog updated successfully!");
  res.redirect(`/blogs/${req.params.id}`);
});

// 🗑️ Delete blog
router.delete("/:id", ensureAuthenticated, async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.status(404).send("Blog not found");

  if (blog.author.toString() !== req.user._id.toString()) {
    req.flash("error_msg", "Not authorized");
    return res.redirect("/blogs");
  }

  await blog.deleteOne();
  req.flash("success_msg", "Blog deleted");
  res.redirect("/blogs");
});

module.exports = router;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });