import "dotenv/config";
import path from "path";
process.env.DOTENV_CONFIG_PATH = path.resolve(__dirname, "../.env");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

import { auth } from "./lib/auth";

async function test() {
  const result = await auth.api.signUpEmail({
    body: { name: "Test", email: "test2@test.com", password: "123456789" },
    headers: new Headers(),
  });
  console.log(JSON.stringify(result, null, 2));
}

test().catch(console.error);
