import { beforeEach, describe, expect, test, vi } from "vitest";
import bcrypt from "bcryptjs";
import { fakeRateLimitBucket } from "@/test/fake-rate-limit-bucket";

// The credentials login had no rate limit, so a password could be guessed as fast as bcrypt
// allows. The limit is per client IP and stored in the database (shared by every serverless
// instance).

const { prisma } = vi.hoisted(() => ({ prisma: {} as Record<string, unknown> }));
vi.mock("@/lib/prisma", () => ({ prisma, hasDatabase: () => true }));

import { authOptions } from "./auth";

type Authorize = (
  credentials: Record<string, string> | undefined,
  req: { headers: Record<string, string> }
) => Promise<unknown>;

// next-auth keeps the user-supplied authorize() on the provider's options.
function authorize(): Authorize {
  const provider = authOptions.providers[0] as unknown as { options: { authorize: Authorize } };
  return provider.options.authorize;
}

const passwordHash = bcrypt.hashSync("correct horse", 4);
const findUser = vi.fn();
let bucket: ReturnType<typeof fakeRateLimitBucket>;

beforeEach(() => {
  vi.clearAllMocks();
  bucket = fakeRateLimitBucket();
  findUser.mockResolvedValue({ id: "u1", email: "owner@akhals.example", name: "Owner", passwordHash });
  Object.assign(prisma, { user: { findUnique: findUser }, rateLimitBucket: bucket });
});

const attempt = (password: string, ip = "203.0.113.7") =>
  authorize()({ email: "owner@akhals.example", password }, { headers: { "x-forwarded-for": ip } }).then(
    (user) => ({ user, error: null as string | null }),
    (err: Error) => ({ user: null, error: err.message })
  );

describe("login rate limit", () => {
  test("a correct password still signs in", async () => {
    expect((await attempt("correct horse")).user).toMatchObject({ id: "u1" });
  });

  test("after 10 attempts in 15 minutes from one IP, the 11th is refused without checking the password", async () => {
    for (let i = 0; i < 10; i++) expect(await attempt("guess")).toEqual({ user: null, error: null });
    expect(findUser).toHaveBeenCalledTimes(10);

    const blocked = await attempt("correct horse");
    expect(blocked).toEqual({ user: null, error: "TooManyAttempts" });
    expect(findUser).toHaveBeenCalledTimes(10);
  });

  test("another IP can still sign in", async () => {
    for (let i = 0; i < 11; i++) await attempt("guess");
    expect((await attempt("correct horse", "198.51.100.2")).user).toMatchObject({ id: "u1" });
  });

  test("if the limiter's storage fails, login is refused (fails closed)", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    bucket.updateMany = () => Promise.reject(new Error("connection reset"));
    expect(await attempt("correct horse")).toEqual({ user: null, error: null });
    expect(findUser).not.toHaveBeenCalled();
  });
});
