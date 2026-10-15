import assert from "node:assert/strict";
import test from "node:test";
import express from "express";

test("async route failures reach Express 4 error middleware", async () => {
  const app = express();
  const original = app.get.bind(app);
  (app as any).get = (route: string, ...handlers: any[]) =>
    original(route, ...handlers.map((handler: any) =>
      (req: express.Request, res: express.Response, next: express.NextFunction) => {
        try { Promise.resolve(handler(req, res, next)).catch(next); } catch (error) { next(error); }
      }
    ));
  app.get("/failure", async () => { throw new Error("expected"); });
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(503).json({ error: err.message });
  });
  const server = app.listen(0, "127.0.0.1");
  try {
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    const response = await fetch(`http://127.0.0.1:${address.port}/failure`);
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { error: "expected" });
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});
