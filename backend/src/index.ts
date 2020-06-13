import express, { static as createStatic } from "express";
import * as bodyParser from "body-parser";

import { entriesApi } from "./routes/entries";
//import { projectsApi } from "./routes/projects";
import { authApi } from "./routes/auth";

import { DatabaseService } from "./services/DatabaseService";
import { UserService } from "./services/UserService";
import { GoogleLoginService } from "./services/GoogleLoginService";
import { AuthService } from "./services/AuthService";

import cookieParser from "cookie-parser";

import * as Config from "./config";

const app = express();
const port = Config.PORT;

const db = new DatabaseService({
  database: Config.DB_SCHEMA,
  host: Config.DB_HOST,
  port: Config.DB_PORT,
  user: Config.DB_USER,
  password: Config.DB_PASSWORD
});

const userService = new UserService(db);
const loginService = new GoogleLoginService(userService, Config.GOOGLE_CLIENT_ID!);
const auth = new AuthService(Config.JWT_SECRET!);

app.use(bodyParser.json());
app.use(cookieParser(Config.JWT_SECRET!));

app.use("/api/entries", entriesApi(db, auth));
//app.use("/api/projects", projectsApi(db, auth));
app.use("/api/auth", authApi(loginService, auth, "/api/auth"));

if(Config.IMAGE_PATH) {
  console.log(`Serving images from ${Config.IMAGE_PATH}`);
  const s = createStatic(Config.IMAGE_PATH);
  app.use('/images', (req, res, next) => {
    console.log(req.path);
    next();
  }, s);
}

if(Config.PUBLIC_HTML) {
  console.log(`Serving static files from ${Config.PUBLIC_HTML}`);
  const s = createStatic(Config.PUBLIC_HTML);
  app.use('/', s);
  app.use('*', s);
}

app.listen(port, () => {
  console.log(`server is listening on ${port}`);
});
