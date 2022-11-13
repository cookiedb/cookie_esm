import { assertEquals } from 'https://deno.land/std@0.163.0/testing/asserts.ts'
import { CookieDB } from "./mod.ts";

// Create test directory
await Deno.run({ cmd: ['cookie', 'init', './test'] }).status()


// Create test user
await Deno.run({ cmd: ['cookie', 'make_user', './test', '--auth=UKTZOvKweOG6tyKQl3q1SZlNx7AthowA']}).status()

// Run cookie
const cookieProcess = Deno.run({
  cmd: ['cookie', 'start', './test']
})

// Wait two seconds for the cookie instance to start up
await new Promise(r => setTimeout(r, 2000));

Deno.test("README demo works", async () => {
  // Initialize instance
  const cookieDB = new CookieDB('http://localhost:8777', 'UKTZOvKweOG6tyKQl3q1SZlNx7AthowA')

  // Create a table with a schema
  await cookieDB.createTable('users', {
    name: 'string',
    description: 'string?',
    age: 'number'
  })

  // Insert document
  const cookieFanKey = await cookieDB.insert('users', {
    name: 'cookie_fan',
    description: null,
    age: 20
  })

  // Get document
  const cookieFan = await cookieDB.get('users', cookieFanKey)

  assertEquals(cookieFan, {
    name: 'cookie_fan',
    description: null,
    age: 20
  })

  // Update document
  await cookieDB.update('users', cookieFanKey, {
    name: 'cookie_fan',
    description: 'a huge fan of cookies',
    age: 21
  })

  // Select document by query
  const usersThatStartWithCookie = await cookieDB.select('users', {
    name: 'starts_with($, "cookie")'
  }, {
    maxResults: 5,
    showKeys: true
  })

  assertEquals(usersThatStartWithCookie, [
    {
      name: 'cookie_fan',
      description: 'a huge fan of cookies',
      age: 21,
      key: cookieFanKey
    }
  ])

  // Delete document
  await cookieDB.delete('users', cookieFanKey)

  // Drop the table
  await cookieDB.dropTable('users')

  await cookieProcess.kill()
})