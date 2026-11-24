import { beforeEach, describe, expect, test, vi } from "vitest";
import { NextRequest } from "next/server";

// The homepage and every /recipes/<slug> page are prerendered at build time. Without an explicit
// revalidation, an admin create/edit/publish/delete changes the database but the public pages keep
// serving the build-time HTML until the next deploy.

const { revalidatePath, prisma } = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  prisma: {
    spice: { upsert: vi.fn().mockResolvedValue({ id: "spice-1" }) },
    recipe: {
      create: vi.fn().mockResolvedValue({ id: "r1", slug: "durban-lamb-curry" }),
      update: vi.fn().mockResolvedValue({ id: "r1", slug: "durban-lamb-curry" }),
      delete: vi.fn().mockResolvedValue({ id: "r1", slug: "durban-lamb-curry" }),
    },
    scanEvent: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
    $transaction: vi.fn(async (ops: unknown[]) => Promise.all(ops)),
  },
}));

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/lib/prisma", () => ({ prisma, hasDatabase: () => true }));
vi.mock("@/lib/admin-session", () => ({ requireAdminSession: async () => null }));

import { POST } from "./recipes/route";
import { PUT, DELETE } from "./recipes/[id]/route";

const ctx = { params: Promise.resolve({ id: "r1" }) };
const json = (method: string, body: unknown) =>
  new NextRequest("http://localhost/api/admin/recipes", { method, body: JSON.stringify(body) });

const validRecipe = {
  slug: "durban-lamb-curry",
  title: "Durban Lamb Curry",
  description: "A slow-cooked lamb curry with Durban masala.",
  spiceSlug: "durban-special",
  prepMinutes: 20,
  cookMinutes: 90,
  servings: 6,
  heroImage: "/img/recipes/durban-chicken-curry.png",
  ingredients: [{ items: ["1 kg lamb"] }],
  instructions: [{ title: "Brown", body: "Brown the lamb." }],
};

function expectPublicPagesRevalidated() {
  expect(revalidatePath).toHaveBeenCalledWith("/");
  expect(revalidatePath).toHaveBeenCalledWith("/recipes");
  // Every recipe page: the edited one, plus the "related recipes" strip on all the others.
  expect(revalidatePath).toHaveBeenCalledWith("/recipes/[slug]", "page");
  expect(revalidatePath).toHaveBeenCalledWith("/sitemap.xml");
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("admin mutations refresh the public pages", () => {
  test("creating a recipe", async () => {
    const res = await POST(json("POST", validRecipe));
    expect(res.status).toBe(201);
    expectPublicPagesRevalidated();
  });

  test("changing a recipe's status (Publish/Draft toggle)", async () => {
    const res = await PUT(json("PUT", { status: "DRAFT" }), ctx);
    expect(res.status).toBe(200);
    expectPublicPagesRevalidated();
  });

  test("editing a recipe", async () => {
    const res = await PUT(json("PUT", { title: "Durban Lamb Curry (family size)", featured: true }), ctx);
    expect(res.status).toBe(200);
    expectPublicPagesRevalidated();
  });

  test("deleting a recipe", async () => {
    const res = await DELETE(json("DELETE", null), ctx);
    expect(res.status).toBe(200);
    expectPublicPagesRevalidated();
  });

  test("a rejected update changes nothing, so it revalidates nothing", async () => {
    const res = await PUT(json("PUT", { status: "ARCHIVED" }), ctx);
    expect(res.status).toBe(400);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  test("a failed database write revalidates nothing", async () => {
    prisma.recipe.update.mockRejectedValueOnce(new Error("connection reset"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await PUT(json("PUT", { status: "DRAFT" }), ctx);
    expect(res.status).toBe(400);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
