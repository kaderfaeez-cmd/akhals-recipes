// In-memory stand-in for prisma.rateLimitBucket, covering only the calls the Prisma rate-limit
// store makes. Lets route tests exercise the real limiter without a database.
interface Bucket {
  key: string;
  count: number;
  resetAt: Date;
}

export function fakeRateLimitBucket() {
  const rows = new Map<string, Bucket>();
  return {
    rows,
    async updateMany({ where, data }: { where: { key: string; resetAt: { gt: Date } }; data: { count: { increment: number } } }) {
      const row = rows.get(where.key);
      if (!row || !(row.resetAt > where.resetAt.gt)) return { count: 0 };
      row.count += data.count.increment;
      return { count: 1 };
    },
    async findUnique({ where }: { where: { key: string } }) {
      const row = rows.get(where.key);
      return row ? { ...row } : null;
    },
    async upsert({ where, create, update }: { where: { key: string }; create: Bucket; update: Omit<Bucket, "key"> }) {
      const row = rows.get(where.key);
      const next = row ? { ...row, ...update } : { ...create };
      rows.set(where.key, next);
      return { ...next };
    },
    async deleteMany({ where }: { where: { resetAt: { lt: Date } } }) {
      let count = 0;
      for (const [key, row] of rows) {
        if (row.resetAt < where.resetAt.lt) {
          rows.delete(key);
          count++;
        }
      }
      return { count };
    },
  };
}
