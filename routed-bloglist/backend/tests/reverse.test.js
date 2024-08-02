const reverse = require("../utils/for_testing").reverse
const { test, describe  } = require("node:test")
const assert = require("node:assert")
describe("reverse", () => {
    test(" of a", () => {
        const result = reverse("a")
        assert.strictEqual(result, "a")
    })

    test(" of react", () => {
        const result = reverse("react")
        assert.strictEqual(result, "tcaer")
    })

    test(" of saippuakauppias", () => {
        const result = reverse("saippuakauppias")
        assert.strictEqual(result, "saippuakauppias")
    })
})
