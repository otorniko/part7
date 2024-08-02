const supertest = require("supertest")
const mongoose = require("mongoose")
const helper = require("../test_helper")
const app = require("../../app")
const api = supertest(app)

const { test, describe, after, beforeEach } = require("node:test")
const assert = require("node:assert")

const Blog = require("../../models/blog")

beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
})

describe("when there are blogs in the database", () => {
    test("blogs are returned as JSON-objects", async () => {
        await api
            .get("/api/blogs")
            .expect(200)
            .expect("Content-Type", /application\/json/)
    })
    test("all blogs are returned", async () => {
        const response = await api.get("/api/blogs")
        assert.strictEqual(response.body.length, helper.initialBlogs.length)
    })

    test("a specific blog is returned", async () => {
        const response = await api.get("/api/blogs")
        const titles = response.body.map(r => r.title)
        assert.strictEqual(titles.length, helper.initialBlogs.length)
    })

    test("all blogs have unique identifiers named id", async () => {
        const idSet = new Set()
        let namedIdAndUnique = true
        const blogs = await helper.blogsInDb()
        blogs.forEach(blog => {
            assert.strictEqual(namedIdAndUnique, true)
            if (!blog.id || idSet.has(blog.id)) {
                namedIdAndUnique = false
            }
            idSet.add(blog.id)
        })
    })
})
describe("viewing a specific blog", () => {
    test("succeeds with a valid id", async () => {
        const blogToView = await helper.blogsInDb()
        const resultBlog = await api
            .get(`/api/blogs/${blogToView[0].id}`)
            .expect(200)
            .expect("Content-Type", /application\/json/)
        assert.deepEqual(resultBlog.body.title, blogToView[0].title)
    })

    test("fails with statuscode 404, if blog does not exist", async () => {
        const validNonexistingId = await helper.nonExistingId()
        await api.get(`/api/blogs/${validNonexistingId}`).expect(404)
    })

    test("fails with statuscode 400, if id is invalid", async () => {
        const invalidId = 69420
        await api.get(`/api/blogs/${invalidId}`).expect(400)
    })
})

describe("addition of a new blog", () => {
    test("posts cannot be added without a user account", async () => {
        await api.post("/api/blogs").send(helper.initialBlogs[0]).expect(401)
    })
    test("succeeds with valid data", async () => {
        const newBlog = {
            title: "Test Blog",
            author: "Tess Tester",
            url: "test.com/testing/tests/test",
            likes: 0,
        }
        const headers = await helper.userAccountForTests()
        await api
            .post("/api/blogs")
            .set("Authorization", headers)
            .send(newBlog)
            .expect(201)
            .expect("Content-Type", /application\/json/)
        const blogsAtEnd = await helper.blogsInDb()

        assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
        assert.deepEqual(blogsAtEnd[blogsAtEnd.length - 1].title, newBlog.title)
        assert.deepEqual(blogsAtEnd[blogsAtEnd.length - 1].author, newBlog.author)
        assert.deepEqual(blogsAtEnd[blogsAtEnd.length - 1].url, newBlog.url)
        assert.strictEqual(blogsAtEnd[blogsAtEnd.length - 1].likes, newBlog.likes)
    })
    test("fails with status code 400 if data is invalid", async () => {
        const newBlog = {
            title: "Test Blog",
            author: "Tess Tester",
            url: "test.com/testing/tests/test",
        }
        const headers = await helper.userAccountForTests()

        delete newBlog.title
        await api.post("/api/blogs").set("Authorization", headers).send(newBlog).expect(400)

        newBlog.title = "Test Blog"
        delete newBlog.author
        await api.post("/api/blogs").set("Authorization", headers).send(newBlog).expect(400)

        newBlog.author = "Tess Tester"
        delete newBlog.url
        await api.post("/api/blogs").set("Authorization", headers).send(newBlog).expect(400)

        const blogsAtEnd = await helper.blogsInDb()
        assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })
    test("likes default to 0 when a value is not provided", async () => {
        const headers = await helper.userAccountForTests()
        const newBlog = {
            title: "test",
            author: "testee",
            url: "blog.test",
        }
        await api
            .post("/api/blogs")
            .set("Authorization", headers)
            .send(newBlog)
            .expect(201)
            .expect("Content-Type", /application\/json/)
            .expect(response => {
                assert.strictEqual(response.body.likes, 0)
            })
    })
    test("user is linked to blog and viceversa", async () => {
        const headers = await helper.userAccountForTests()

        const newBlog = {
            title: "test",
            author: "testee",
            url: "blog.test",
        }
        const response = await api
            .post("/api/blogs")
            .set("Authorization", headers)
            .send(newBlog)
            .expect(201)
            .expect("Content-Type", /application\/json/)
        assert.ok(response.body.user)
        const users = await helper.usersInDb()
        const userWithMatchingBlog = users.find(user => {
            return user.blogs.some(blog => blog.toString() === response.body.id.toString())
        })
        assert.ok(userWithMatchingBlog)
    })
})

describe("deletion of a blog", () => {
    test("posts cant be deleted without a user account", async () => {
        await api.delete(`/api/blogs/${helper.initialBlogs[0].id}`).expect(401)
    })
    test("succeeds with status code 204 if, id is valid", async () => {
        const blog = helper.initialBlogs[0]
        const headers = await helper.userAccountForTests()
        const blogsAtStart = await helper.blogsInDb()
        const response = await api
            .post("/api/blogs/")
            .set("Authorization", headers)
            .send(blog)
            .expect(201)
        await api.delete(`/api/blogs/${response.body.id}`).set("Authorization", headers).expect(204)
        const blogsAtEnd = await helper.blogsInDb()
        assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
    })
    test("only blog creator can delete a blog", async () => {
        const token1 = await helper.userAccountForTests()

        const blog = {
            title: "test title",
            author: "test author",
            url: "test url",
        }

        const token2 = await helper.userAccountForTests()

        const responseBlog = await api
            .post("/api/blogs")
            .set("Authorization", `${token1}`)
            .send(blog)
            .expect(201)

        const blogToDelete = responseBlog.body

        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set("Authorization", `${token2}`)
            .expect(401)

        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set("Authorization", `${token1}`)
            .expect(204)
    })
})
describe("updating a blog", () => {
    test("posts cant be updated without a user account", async () => {
        await api
            .put(`/api/blogs/${helper.initialBlogs[0].id}`)
            .send(helper.initialBlogs[1])
            .expect(401)
    })
    test("only poster can update", async () => {
        const headers = await helper.userAccountForTests()
        const blog = {
            title: "test title",
            author: "test author",
            url: "test url",
        }
        const responseBlog = await api
            .post("/api/blogs")
            .set("Authorization", headers)
            .send(blog)
            .expect(201)

        const wrongUser = await helper.userAccountForTests()
        const updatedBlog = {
            title: "new title",
            author: "new author",
            url: "new url",
            likes: 1,
        }
        await api
            .put(`/api/blogs/${responseBlog.body.id}`)
            .set("Authorization", wrongUser)
            .send(updatedBlog)
            .expect(401)
        await api
            .get(`/api/blogs/${responseBlog.body.id}`)
            .expect(200)
            .expect(response => {
                assert.strictEqual(response.body.title, blog.title)
                assert.strictEqual(response.body.author, blog.author)
                assert.strictEqual(response.body.url, blog.url)
            })
        await api
            .put(`/api/blogs/${responseBlog.body.id}`)
            .set("Authorization", headers)
            .send(updatedBlog)
            .expect(200)

        await api
            .get(`/api/blogs/${responseBlog.body.id}`)
            .expect(200)
            .expect(response => {
                assert.strictEqual(response.body.title, updatedBlog.title)
                assert.strictEqual(response.body.author, updatedBlog.author)
                assert.strictEqual(response.body.url, updatedBlog.url)
            })
    })
    test("anyone can update likes", async () => {
        const headers = await helper.userAccountForTests()
        const blog = {
            title: "test title",
            author: "test author",
            url: "test url",
            likes: 0,
        }
        const responseBlog = await api
            .post("/api/blogs")
            .set("Authorization", headers)
            .send(blog)
            .expect(201)

        const updatedBlog = {
            likes: 1,
        }
        await api
            .put(`/api/blogs/${responseBlog.body.id}`)
            .set("Authorization", headers)
            .send(updatedBlog)
            .expect(200)
            .expect(response => {
                assert.strictEqual(response.body.likes, updatedBlog.likes)
                assert.strictEqual(response.body.likes, blog.likes + 1)
            })
    })

    test("succeeds with valid data and returns updated blog", async () => {
        const headers = await helper.userAccountForTests()
        const blogsAtStart = await helper.blogsInDb()
        const blog = {
            title: blogsAtStart[0].title,
            author: blogsAtStart[0].author,
            url: blogsAtStart[0].url,
            likes: blogsAtStart[0].likes,
        }
        const blogToUpdate = await api
            .post("/api/blogs")
            .set("Authorization", headers)
            .send(blog)
            .expect(201)

        const updatedBlog = {
            title: blogsAtStart[0].title,
            author: blogsAtStart[0].author,
            url: blogsAtStart[0].url,
            likes: blogsAtStart[0].likes + 1,
        }
        const blogFromRes = await api
            .put(`/api/blogs/${blogToUpdate.body.id}`)
            .set("Authorization", headers)
            .send(updatedBlog)
            .expect(200)
            .expect("Content-Type", /application\/json/)

        assert.strictEqual(blogFromRes.body.likes, blogsAtStart[0].likes + 1)
        assert.strictEqual(blogFromRes.body.title, blogsAtStart[0].title)
        assert.strictEqual(blogFromRes.body.author, blogsAtStart[0].author)
        assert.strictEqual(blogFromRes.body.url, blogsAtStart[0].url)
    })
})

after(async () => {
    await mongoose.connection.close()
})
