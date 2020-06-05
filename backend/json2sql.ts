import fs from "fs";
import mysql from "mysql";

fs.readFile('../posts.json', {encoding: 'utf8'}, (err, data) => {
  const arr = JSON.parse(data) as  any[];
  const sql = arr.map(obj => mysql.format("INSERT INTO entries (user_id, date, text, created, modified) VALUES (1, ?, ?, ?, ?)", [obj.date, obj.data?.log?.body || "", new Date(obj.created), new Date(obj.updated || obj.created)]));
  for(const row of sql)
    console.log(row + ";")
})