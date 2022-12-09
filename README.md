# CookieDB for ESM

> A fast and correct [CookieDB](https://github.com/cookiedb/CookieDB) driver for
> esm platforms (like Deno or the web)

Documentation for this module can be found
[here](https://deno.land/x/cookie_driver/mod.ts).

Documentation for CookieDB can be found on
[the official Github repo](https://github.com/cookiedb/CookieDB).

## Example

```typescript
import { CookieDB } from "https://deno.land/x/cookie_driver/mod.ts";

// Initialize instance
const cookieDB = new CookieDB(
  "http://localhost:8777",
  "UKTZOvKweOG6tyKQl3q1SZlNx7AthowA",
);

// Create a table with a schema
await cookieDB.createTable("users", {
  name: "string",
  description: "string?",
  age: "number",
});

// Insert document
const cookieFanKey = await cookieDB.insert("users", {
  name: "cookie_fan",
  description: null,
  age: 20,
});

// Get document
const cookieFan = await cookieDB.get("users", cookieFanKey);

// Update document
await cookieDB.update("users", cookieFanKey, {
  name: "cookie_fan",
  description: "a huge fan of cookies",
  age: 21,
});

// Select document by query
const usersThatStartWithCookie = await cookieDB.select(
  "users",
  'starts_with($name, "cookie")',
  {
    maxResults: 5,
    showKeys: true,
  },
);

// Delete document
await cookieDB.delete("users", cookieFanKey);

// Drop the table
await cookieDB.dropTable("users");
```
