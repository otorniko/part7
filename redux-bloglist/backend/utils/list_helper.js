const dummy = blogs => {
    return blogs.length === 0 ? 1 : blogs.length / blogs.length
}

const totalLikes = blogs => {
    return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = blogs => {
    if (blogs.length === 0) {
        return null
    } else {
        const blogWithMostLikes = blogs.reduce((maxLikesBlog, currentBlog) => {
            if (currentBlog.likes > maxLikesBlog.likes) {
                return currentBlog
            } else {
                return maxLikesBlog
            }
        })

        const { title, author, likes } = blogWithMostLikes
        return { title, author, likes }
    }
}

const mostBlogs = blogs => {
    if (blogs.length === 0) {
        return null
    } else if (blogs.length === 1) {
        return blogs[0].author
    }

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

    return authorWithMostBlogs
}

const blogs = [
    {
        _id: "5a422a851b54a676234d17f7",
        title: "React patterns",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 7,
        __v: 0,
    },
    {
        _id: "5a422aa71b54a676234d17f8",
        title: "Go To Statement Considered Harmful",
        author: "Edsger W. Dijkstra",
        url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
        likes: 5,
        __v: 0,
    },
    {
        _id: "5a422b3a1b54a676234d17f9",
        title: "Canonical string reduction",
        author: "Edsger W. Dijkstra",
        url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
        likes: 12,
        __v: 0,
    },
    {
        _id: "5a422b891b54a676234d17fa",
        title: "First class tests",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
        likes: 10,
        __v: 0,
    },
    {
        _id: "5a422ba71b54a676234d17fb",
        title: "TDD harms architecture",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
        likes: 0,
        __v: 0,
    },
    {
        _id: "5a422bc61b54a676234d17fc",
        title: "Type wars",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
        likes: 2,
        __v: 0,
    },
]

const blog = blogs.slice(0, 1)


module.exports = {
    blog,
    blogs,
    dummy,
    totalLikes,
    mostBlogs,
    favoriteBlog,
}
