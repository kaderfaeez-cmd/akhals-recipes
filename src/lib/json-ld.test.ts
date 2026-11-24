import { describe, expect, test } from "vitest";
import { serializeJsonLd } from "./json-ld";

// The recipe page writes this string into <script type="application/ld+json"> with
// dangerouslySetInnerHTML. JSON.stringify leaves "<" alone, so a recipe title or step containing
// "</script><script>…" would close the tag and run as script for every visitor.

const hostile = {
  "@type": "Recipe",
  name: 'Curry</script><script>alert("x")</script>',
  recipeInstructions: [{ "@type": "HowToStep", text: "Stir <!-- then --> & serve > 3 min" }],
};

describe("serializeJsonLd", () => {
  test("output contains no raw <, > or &", () => {
    const out = serializeJsonLd(hostile);
    expect(out).not.toContain("<");
    expect(out).not.toContain(">");
    expect(out).not.toContain("&");
    expect(out.toLowerCase()).not.toContain("</script");
  });

  test("uses the six-character JSON escapes, not the characters themselves", () => {
    const out = serializeJsonLd({ s: "<>&" });
    // In this source, "\\u003c" is the text backslash-u-0-0-3-c. With a single backslash it would
    // be "<" again — the exact bug another repo shipped. The length check catches that mistake even if
    // it is made in this expectation too.
    expect(out).toHaveLength('{"s":""}'.length + 18);
    expect(out).toBe('{"s":"\\u003c\\u003e\\u0026"}');
    expect(out.split("\\").length - 1).toBe(3);
  });

  test("is still valid JSON that decodes to the same data", () => {
    expect(JSON.parse(serializeJsonLd(hostile))).toEqual(hostile);
  });
});
