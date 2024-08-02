const blogsRouter = require("express").Router()
const mongoose = require("mongoose")
const Blog = require("../models/blog")

blogsRouter.get("/", async (request, response) => {
    const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 })
    response.json(blogs)
})

blogsRouter.get("/:id", async (request, response) => {
    const id = request.params.id
    if (!mongoose.isValidObjectId(id)) {
        return response.status(400).end()
    }
    const blog = await Blog.findById(id).populate("user", { username: 1, name: 1 })
    if (blog) {
        response.status(200).json(blog)
    } else {
        response.status(404).end()
    }
})

blogsRouter.post("/", async (request, response) => {
    const { body, user } = request
    if (!user) {
        response.status(401).end()
    }
    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
        user: user._id,
    })
    const savedBlog = await blog.save()

    user.blogs = user.blogs || []
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)
})

blogsRouter.put("/:id", async (request, response) => {
    const blog = await Blog.findById(request.params.id)
    if (!blog) {
        response.status(404).end()
    }
    const body = request.body
    const validateUpdateData = body => {
        const validBlog = new Blog({
            title: body.title,
            author: body.author,
            url: body.url,
            likes: body.likes,
        })
        const dataValidationError = validBlog.validateSync()
        if (dataValidationError) {
            return dataValidationError
        }
        return null
    }
    const blogUpdate = {}
    if (body.likes) {
        blogUpdate.likes = body.likes
    }
    const validationError = validateUpdateData(body)
    if (validationError && body.likes) {
        await Blog.findByIdAndUpdate(request.params.id, blogUpdate, { new: true })
        response.status(200).json(blogUpdate)
    } else if (validationError) {
        return response.status(400).json({ error: validationError.message })
    }
    if (request.user && blog.user.toString() === request.user._id.toString()) {
        if (body.title) {
            blogUpdate.title = body.title
        }
        if (body.author) {
            blogUpdate.author = body.author
        }
        if (body.url) {
            blogUpdate.url = body.url
        }
        if (body.likes) {
            blogUpdate.likes = body.likes
        }
        await Blog.findByIdAndUpdate(request.params.id, blogUpdate, { new: true })
        response.status(200).json(blogUpdate)
    } else {
        response.status(401).end()
    }
})

blogsRouter.delete("/:id", async (request, response) => {
    const blog = await Blog.findById(request.params.id)
    if (blog) {
        if (blog.user.toString() === request.user._id.toString()) {
            await Blog.findByIdAndDelete(request.params.id)
            response.status(204).end()
        } else {
            response.status(401).end()
        }
    }
    response.status(404).end()
})

module.exports = blogsRouter
