const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const jwt = require("jsonwebtoken");
const app = express();
const bcrypt = require("bcrypt");
app.use(express.json());
const databasePath = path.join(__dirname, "covid19IndiaPortal.db");
let db = null;
const initializeDatabase = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("http://localhost:3000");
    });
  } catch (e) {
    console.log(`error ${e}`);
    process.exit(1);
  }
};
initializeDatabase();

app.post("/login/", async (request, response) => {
  const { username, password } = request.body;
  let passwordLength = password.length;
  const check_query = `
  SELECT
    *
  FROM
  user
  WHERE
  username="${username}";`;
  const checkOutput = await db.get(check_query);
  if (checkOutput === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const passwordForHashing = bcrypt.compare(password, checkOutput.password);
    console.log(await passwordForHashing);
    if (passwordForHashing === true) {
      const payload = {
        username: username,
      };
      const token = jwt.sign(payload, "my_token");
      response.send({ token });
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});
