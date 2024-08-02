const listHelper = require("../utils/list_helper")
const { test, describe } = require("node:test")
const assert = require("node:assert")
const blog = listHelper.blog
const blogs = listHelper.blogs

describe("mostBlogs", () => {
    test("mostBlogs of empty list is null", () => {
        assert.strictEqual(listHelper.mostBlogs([]), null)
    })

    test("when list has one author the author with most blogs is that", () => {
        assert.strictEqual(listHelper.mostBlogs(blog), blog[0].author)
    })

    test("of a bigger list is calculated right", () => {
        const authorCounts = {}
        for (const blog of blogs) {
            const author = blog.author

            if (author in authorCounts) {
                authorCounts[author]++
            } else {
                authorCounts[author] = 1
            }
        }

        let maxBlogs = 0
        let authorWithMostBlogs = null

        for (const author in authorCounts) {
            if (authorCounts[author] > maxBlogs) {
                maxBlogs = authorCounts[author]
                authorWithMostBlogs = author
            }
        }
        assert.strictEqual(listHelper.mostBlogs(blogs), authorWithMostBlogs)
    })
})

describe("favoriteBlog", () => {
    test("favoriteBlog of empty list is null", () => {
        assert.strictEqual(listHelper.favoriteBlog([]), null)
    })

    test("when list has one blog that equals the favorite blog is that", () => {
        const { title, author, likes } = blog[0]
        assert.deepStrictEqual(listHelper.favoriteBlog(blog), { title, author, likes })
    })

    test("of a bigger list is calculated right", () => {
        const expecetedBlog = blogs.reduce((mostLikedBlog, currentBlog) => {
            if (currentBlog.likes > mostLikedBlog.likes) {
                return currentBlog
            } else {
                return mostLikedBlog
            }
        })
        const { title, author, likes } = expecetedBlog
        assert.deepStrictEqual(listHelper.favoriteBlog(blogs), { title, author, likes })
    })
})

describe("totalLikes", () => {
    test("totalLikes of empty list is zero", () => {
        assert.strictEqual(listHelper.totalLikes([]), 0)
    })

    test("when list has one blog equals the likes of that", () => {
        assert.strictEqual(listHelper.totalLikes(blog), blog[0].likes)
    })

    test("of a bigger list is calculated right", () => {
        const expectedLikes = blogs.reduce((sum, blog) => sum + blog.likes, 0)
        assert.strictEqual(listHelper.totalLikes(blogs), expectedLikes)
    })
})

/* test("dummy returns one", () => {
    const noBlogs = []
    const result = listHelper.dummy(noBlogs)
    assert.strictEqual(result, 1)
}) */
