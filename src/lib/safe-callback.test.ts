import { describe, expect, test } from "vitest";
import { safeAdminCallback } from "./safe-callback";

// The login page sends the user to ?callbackUrl= after signing in. Unchecked, a link like
// /admin/login?callbackUrl=https://evil.example sends a freshly signed-in admin to a phishing page.

describe("safeAdminCallback", () => {
  test.each([
    ["/admin", "/admin"],
    ["/admin/recipes/new", "/admin/recipes/new"],
    ["/admin/recipes/ckx1?tab=seo#top", "/admin/recipes/ckx1?tab=seo#top"],
    ["/admin/analytics", "/admin/analytics"],
  ])("keeps the same-origin admin path %s", (raw, expected) => {
    expect(safeAdminCallback(raw)).toBe(expected);
  });

  test.each([
    null,
    undefined,
    "",
    "https://evil.example/admin",
    "http://evil.example",
    "//evil.example/admin",
    "/\\evil.example",
    "\\\\evil.example",
    "/\t/evil.example",
    " //evil.example",
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "/admin/..//evil.example",
    "/admin//evil.example",
    "/administrator",
    "/recipes",
    "/",
    "admin",
    "/admin/login",
    "/admin/login?callbackUrl=https://evil.example",
  ])("falls back to /admin for %j", (raw) => {
    expect(safeAdminCallback(raw)).toBe("/admin");
  });
});
