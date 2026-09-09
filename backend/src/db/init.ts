import fs from "node:fs";
import path from "node:path";
import db from "./database";

const schemaPath = path.resolve(process.cwd(), "schema.sql");
const schema = fs.readFileSync(schemaPath, "utf-8");

db.exec(schema);

