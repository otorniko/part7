const { describe, beforeEach, test, expect } = require("@playwright/test")

describe("Blog app", () => {
    beforeEach(async ({ page, request }) => {
        await request.post("http://127.0.0.1:3003/api/testing/reset")
        await request.post("http://127.0.0.1:3003/api/users", {
            data: {
                name: "Play Wright",
                username: "Play Test",
                password: "secretTestPassword",
            },
        })
        await page.goto("http://localhost:5173")
    })
    test("front page can be opened", async ({ page }) => {
        const locator = await page.getByText("log in to application")
        await expect(locator).toBeVisible()
        await expect(page.getByText("Blog app, otorniko 🤯 2024")).toBeVisible()
    })
    describe("login", () => {
        test("login, succeeds with the right credentials", async ({ page }) => {
            await page.getByRole("textbox").first().fill("Play Test")
            await page.getByRole("textbox").last().fill("secretTestPassword")

            const loginButton = await page.getByRole("button", { name: "Log in" })
            await loginButton.dispatchEvent("mousedown")

            await expect(page.getByText("Welcome back, Play Test!")).toBeVisible()
        })
        test("login, fails with incorrect credentials", async ({ page }) => {
            await page.getByRole("textbox").first().fill("Play Test")
            await page.getByRole("textbox").last().fill("wrongPassword")
            const loginButton = await page.getByRole("button", { name: "Log in" })
            await loginButton.dispatchEvent("mousedown")
            await expect(page.getByText("Invalid username or password")).toBeVisible()
        })
        describe("when logged in", () => {
            beforeEach(async ({ page }) => {
                await page.getByRole("textbox").first().fill("Play Test")
                await page.getByRole("textbox").last().fill("secretTestPassword")
                const loginButton = await page.getByRole("button", { name: "Log in" })
                await loginButton.dispatchEvent("mousedown")
            })
            test("user can logout", async ({ page }) => {
                const logoutButton = await page.getByRole("button", { name: "Logout" })
                await logoutButton.dispatchEvent("mousedown")

                await expect(page.getByText("goodbye Play Test")).toBeVisible()
            })
            test("new blog form can be opened", async ({ page }) => {
                const newBlogButton = await page.getByRole("button", { name: "New Blog" })
                await newBlogButton.dispatchEvent("mousedown")

                await expect(page.getByText("New Blog:")).toBeVisible()
            })
            test("new blog form can be closed", async ({ page }) => {
                const newBlogButton = await page.getByRole("button", { name: "New Blog" })
                await newBlogButton.dispatchEvent("mousedown")
                const closeFormButton = await page.getByRole("button", { name: "cancel" })
                await closeFormButton.dispatchEvent("mousedown")
                await expect(page.getByText("New Blog:")).not.toBeVisible()
            })
            test("new blog can be added", async ({ page }) => {
                const newBlogButton = await page.getByRole("button", {
                    name: "New Blog",
                })
                await newBlogButton.dispatchEvent("mousedown")
                const textboxes = await page.getByRole("textbox").all()
                await textboxes[0].fill("Playwright")
                await textboxes[1].fill("E2E testing with Playwright is awesome!")
                await textboxes[2].fill("playwright.dev")
                const submitButton = await page.getByRole("button", { name: "Submit" })
                await submitButton.dispatchEvent("mousedown")
                const locator = await page.locator('[data-testid="title-cell"]')
                await expect(locator).toContainText("E2E testing with Playwright is awesome!")
            })
            describe("when there are blogs posted by other users", () => {
                test("blog can be liked", async ({ page }) => {
                    // Assuming there is at least one blog post
                    const likeButton = await page.getByRole("button", { name: "Like" })
                    await likeButton.dispatchEvent("mousedown")
                    await expect(page.getByText("Likes: 1")).toBeVisible()
                })

                test("user can delete their own blog", async ({ page }) => {
                    // Assuming there is at least one blog post created by the logged-in user
                    const deleteButton = await page.getByRole("button", { name: "Delete" })
                    await deleteButton.dispatchEvent("mousedown")
                    await expect(page.getByText("Blog deleted successfully")).toBeVisible()
                })

                test("only the user who added the blog can see the delete button", async ({
                    page,
                }) => {
                    // Assuming there is at least one blog post created by another user
                    const deleteButton = await page.getByRole("button", { name: "Delete" })
                    await expect(deleteButton).not.toBeVisible()
                })

                test("blogs are arranged in order of likes, with the most likes first", async ({
                    page,
                }) => {
                    // Assuming there are multiple blog posts with different numbers of likes
                    const likeButtons = await page.getByRole("button", { name: "Like" }).all()
                    const likes = await Promise.all(
                        likeButtons.map(async button => {
                            await button.dispatchEvent("mousedown")
                            const likesText = await page.getByTestId("likes-count").innerText()
                            return parseInt(likesText)
                        })
                    )
                    const sortedLikes = [...likes].sort((a, b) => b - a)
                    await expect(likes).toEqual(sortedLikes)
                })
            })
        })
    })
})
