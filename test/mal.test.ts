import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { deleteUrl, getIdFromUrl, listTypeFromUrl, typeSearchOrder } from "../src/mal.ts";

describe("getIdFromUrl", () => {
  it("extracts the id for the matching type", () => {
    assert.equal(getIdFromUrl("https://myanimelist.net/anime/5114/x", "anime"), "5114");
  });

  it("returns null when the type does not match", () => {
    assert.equal(getIdFromUrl("https://myanimelist.net/anime/5114", "manga"), null);
  });

  it("returns null when there is no numeric id", () => {
    assert.equal(getIdFromUrl("https://myanimelist.net/anime/", "anime"), null);
  });
});

describe("listTypeFromUrl", () => {
  it("detects anime lists", () => {
    assert.equal(listTypeFromUrl("https://myanimelist.net/animelist/user"), "anime");
  });

  it("detects manga lists", () => {
    assert.equal(listTypeFromUrl("https://myanimelist.net/mangalist/user"), "manga");
  });

  it("returns null on unrelated pages", () => {
    assert.equal(listTypeFromUrl("https://myanimelist.net/profile/user"), null);
  });
});

describe("typeSearchOrder", () => {
  it("prefers manga on a manga list", () => {
    assert.deepEqual(typeSearchOrder("manga"), ["manga", "anime"]);
  });

  it("prefers anime on an anime list", () => {
    assert.deepEqual(typeSearchOrder("anime"), ["anime", "manga"]);
  });

  it("falls back to anime-first when the list type is unknown", () => {
    assert.deepEqual(typeSearchOrder(null), ["anime", "manga"]);
  });
});

describe("deleteUrl", () => {
  it("builds the ownlist delete endpoint", () => {
    assert.equal(deleteUrl("anime", "5114"), "https://myanimelist.net/ownlist/anime/5114/delete");
  });
});
