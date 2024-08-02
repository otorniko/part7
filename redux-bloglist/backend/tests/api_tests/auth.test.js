const mongoose = require("mongoose")
const supertest = require("supertest")
const app = require("../../app")
const api = supertest(app)
const helper = require("../test_helper")
const Blog = require("../../models/blog")
const User = require("../../models/user")
const bcrypt = require("bcrypt")
const { test, describe, after, beforeEach } = require("node:test")
const assert = require("node:assert")

beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
})

/* test("tests work", async () => {
    const number = 1
    assert(number === 1)
}) */

describe("authentication starts with access control", () => {
    test("can not log in without a user account", async () => {
        const fakeUser = {
            username: "fakeUser",
            password: "fake",
        }
        await api.post("/api/login").send(fakeUser).expect(401)
    })
})

describe("when there is initially one user in db", () => {
    beforeEach(async () => {
        await User.deleteMany({})
        const passwordHash = await bcrypt.hash("sekret", 10)
        const user = new User({ username: "root", name: "Superuser", passwordHash })
        await user.save()
    })

    test("creation succeeds with a unique username", async () => {
        const usersAtStart = await helper.usersInDb()
        const newUser = {
            username: "otorniko",
            name: "Otto Tornikoski",
            password: "salasana",
        }
        await api
            .post("/api/users")
            .send(newUser)
            .expect(201)
            .expect("Content-Type", /application\/json/)
            .expect(response => {
                assert.strictEqual(response.body.username, newUser.username)
            })
        const usersAtEnd = await helper.usersInDb()
        assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)
        const usernames = usersAtEnd.map(u => u.username)
        assert.ok(usernames.find(username => username === newUser.username))
    })

    test("creation fails with proper statuscode and message if username already taken", async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: "root",
            name: "Superuser",
            password: "salasana",
        }

        await api
            .post("/api/users")
            .send(newUser)
            .expect(400)
            .expect("Content-Type", /application\/json/)
            .expect(response => {
                assert.match(response.body.error, /expected `username` to be unique/)
            })

        const usersAtEnd = await helper.usersInDb()
        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test("fails with status code 400 if username or password has less than 3 characters", async () => {
        const usersAtStart = await helper.usersInDb()
        const newUser = {
            username: "us",
            name: "User",
            password: "pw",
        }
        await api.post("/api/users").send(newUser).expect(400)
        const usersAtEnd = await helper.usersInDb()
        newUser.username = "user"
        await api.post("/api/users").send(newUser).expect(400)
        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test("fails with status code 400 if name, username or password is missing", async () => {
        const usersAtStart = await helper.usersInDb()
        const newUser = {
            username: "user",
            name: "User",
        }
        await api.post("/api/users").send(newUser).expect(400)
        const usersAtEnd = await helper.usersInDb()
        assert.strictEqual(usersAtEnd.length, usersAtStart.length)

        newUser.password = "password"
        delete newUser.username
        await api.post("/api/users").send(newUser).expect(400)
        newUser.username = "user"
        delete newUser.name
        await api.post("/api/users").send(newUser).expect(400)
        const usersAtEnd2 = await helper.usersInDb()
        assert.strictEqual(usersAtEnd2.length, usersAtStart.length)
    })

    test("fails with status code 400 if username is not unique", async () => {
        const usersAtStart = await helper.usersInDb()
        const newUser = {
            username: "root",
            name: "User",
            password: "password",
        }
        await api.post("/api/users").send(newUser).expect(400)
        const usersAtEnd = await helper.usersInDb()
        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })
    test("receive user id when account creation is successful", async () => {
        const username = Date.now()
        const user = {
            username: username,
            name: "fake",
            password: "fake",
        }
        const response = await api.post("/api/users").send(user).expect(201)
        assert.ok(response.body.id)
    })
})

describe("user authentication", () => {
    test("returns 401 when username or password is incorrect", async () => {
        const username = Date.now()
        const user = {
            username: username,
            name: "fake",
            password: "fake",
        }
        const userWithIncorrectPassword = {
            username: username,
            password: "wrong",
        }
        const userWithIncorrectUsername = {
            username: "username",
            password: "fake",
        }
        await api.post("/api/users").send(user).expect(201)
        await api.post("/api/login").send(user).expect(200)
        await api.post("/api/login").send(userWithIncorrectPassword).expect(401)
        await api.post("/api/login").send(userWithIncorrectUsername).expect(401)
    })
    test("returns jwt token on successful login", async () => {
        const username = Date.now()
        const user = {
            username: username,
            name: "fake",
            password: "fake",
        }
        await api.post("/api/users").send(user)
        const response = await api.post("/api/login").send(user)
        const token = response.body.token
        assert.ok(token)
    })
    test("is required to post blogs", async () => {
        const blog = {
            title: "title",
            author: "author",
            url: "url",
        }
        await api.post("/api/blogs").send(blog).expect(401)
        const token = await helper.userAccountForTests()
        const postedBlog = await api
            .post("/api/blogs")
            .set("Authorization", token)
            .send(blog)
            .expect(201)

        const blogFromGet = await api.get(`/api/blogs/${postedBlog.body.id}`)
        assert.strictEqual(blogFromGet.body.id, postedBlog.body.id)
    })
    test("is required to edit blogs", async () => {
        const token = await helper.userAccountForTests()
        assert.ok(token)

        const blogToSend = {
            title: "title",
            author: "author",
            url: "url",
        }
        const responseBlog = await api
            .post("/api/blogs")
            .set("Authorization", token)
            .send(blogToSend)
            .expect(201)

        const blogToPut = { likes: 1, ...blogToSend }
        await api.put(`/api/blogs/${responseBlog.body.id}`).send(blogToPut).expect(401)

        const uneditedBlog = await Blog.findById(responseBlog.body.id)
        assert.strictEqual(uneditedBlog.likes, 0)

        const returnedBlog = await api
            .put(`/api/blogs/${responseBlog.body.id}`)
            .set("Authorization", token)
            .send(blogToPut)
            .expect(200)
        assert.strictEqual(returnedBlog.body.likes, 1)
    })
    test("is required to delete blogs", async () => {
        const token = await helper.userAccountForTests()

        const blog = {
            title: "test title",
            author: "test author",
            url: "test url",
        }
        const blogsBeforePost = await helper.blogsInDb()

        const responseBlog = await api
            .post("/api/blogs")
            .set("Authorization", token)
            .send(blog)
            .expect(201)

        const blogsAfterPost = await helper.blogsInDb()
        assert.strictEqual(blogsAfterPost.length, blogsBeforePost.length + 1)

        await api.delete(`/api/blogs/${blog.id}`).expect(401)

        const blogsAfterFirstDelete = await helper.blogsInDb()
        assert.strictEqual(blogsAfterFirstDelete.length, blogsAfterPost.length)

        await api
            .delete(`/api/blogs/${responseBlog.body.id}`)
            .set("Authorization", token)
            .expect(204)

        const blogsAfterRealDelete = await helper.blogsInDb()
        assert.strictEqual(blogsAfterRealDelete.length, blogsAfterPost.length - 1)
    })

})
after(async () => {
    await mongoose.connection.close()
})
