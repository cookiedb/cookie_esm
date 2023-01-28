// ex. scripts/build_npm.ts
import { build, emptyDir } from "https://deno.land/x/dnt@0.33.0/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  shims: {
    deno: true,
    undici: true,
  },
  package: {
    // package.json properties
    name: "cookie-driver",
    version: Deno.args[0],
    description: "A fast and correct CookieDB driver for Node.js",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/cookiedb/cookie_esm.git",
    },
    bugs: {
      url: "https://github.com/cookiedb/cookie_esm/issues",
    },
  },
  test: false,
  typeCheck: false,
});

// post build steps
Deno.copyFileSync("LICENSE", "npm/LICENSE");
Deno.copyFileSync("README.md", "npm/README.md");
