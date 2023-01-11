import { assertEquals } from "https://deno.land/std@0.171.0/testing/asserts.ts";
import { CookieDB } from "./mod.ts";

// Create test directory
await Deno.run({ cmd: ["cookie", "init", "./test"] }).status();

// Create test user
await Deno.run({
  cmd: [
    "cookie",
    "create_user",
    "./test",
    "--token=UKTZOvKweOG6tyKQl3q1SZlNx7AthowA",
    "--admin",
  ],
}).status();

// Run cookie
const cookieProcess = Deno.run({
  cmd: ["cookie", "start", "./test"],
});

// Wait two seconds for the cookie instance to start up
await new Promise((r) => setTimeout(r, 2000));

Deno.test("README demo works", async () => {
  // Initialize instance
  const cookieDB = new CookieDB(
    "http://localhost:8777",
    "UKTZOvKweOG6tyKQl3q1SZlNx7AthowA",
  );

  // Create a table with a schema
  await cookieDB.createTable("users", {
    name: "string",
    description: "nullable string",
    age: "number",
  });

  // Get schema for a table
  assertEquals(await cookieDB.metaTable("users"), {
    schema: {
      name: "string",
      description: "nullable string",
      age: "number",
    },
    size: 0,
  });

  // Get schemas for all table
  assertEquals(await cookieDB.meta(), {
    tables: {
      users: {
        schema: {
          name: "string",
          description: "nullable string",
          age: "number",
        },
      },
    },
    size: 159,
  });

  // Insert document
  const cookieFanKey = await cookieDB.insert("users", {
    name: "cookie_fan",
    description: null,
    age: 20,
  });

  // Get document
  const cookieFan = await cookieDB.get("users", cookieFanKey);

  assertEquals(cookieFan, {
    name: "cookie_fan",
    description: null,
    age: 20,
  });

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
    },
  );

  assertEquals(usersThatStartWithCookie, [
    {
      name: "cookie_fan",
      description: "a huge fan of cookies",
      age: 21,
      key: cookieFanKey,
    },
  ]);

  // Delete document
  await cookieDB.delete("users", cookieFanKey);

  // Drop the table
  await cookieDB.dropTable("users");

  // Create a user
  const { username, token } = await cookieDB.createUser({
    username: "cookie fan",
    token: "a_very_secure_password",
  });
  assertEquals("cookie fan", username);
  assertEquals("a_very_secure_password", token);

  // Delete a user
  await cookieDB.deleteUser("cookie fan");

  await cookieProcess.kill();
});
