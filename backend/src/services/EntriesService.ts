import { DatabaseService } from "./DatabaseService";
import { Entry } from "../models/entry";

export class EntriesService {
  private db: DatabaseService;

  constructor(databaseService: DatabaseService) {
    this.db = databaseService;
  }

  async getEntriesByUserId(userId:number, year?:number, month?:number) {
    const values = [userId];
    if(year) values.push(year);
    if(month) values.push(month);

    const sql = `SELECT * FROM entries WHERE user_id = ? ${year ? 'AND YEAR(date) = ?': ''} ${month ? 'AND MONTH(date) = ?' : ''} AND deleted IS NULL ORDER BY date ASC`;
    console.log(sql);
    return await this.db.query(sql, values);
  }
  private async getEntryById(id:number) {
    const sql = 'SELECT * FROM entries WHERE id = ?';
    return (await this.db.query(sql, id))?.[0];
  }  

  async createEntry(entry:Entry) {
    const dbRes = await this.db.query('INSERT INTO entries SET ?', [entry]);
    console.log('inserted entry. dbRes:');
    console.dir(dbRes);
    return await this.getEntryById(dbRes.insertId);
    
  }
  async updateEntry(entry:Partial<Entry>) {
    const {id, user_id} = entry;
    delete entry.id;
    delete entry.user_id;
    const sql = 'UPDATE entries SET ? WHERE user_id = ? AND id = ?'
    const dbRes = await this.db.query(sql, [entry, user_id, id]);
    return  await this.getEntryById(id!);
  }

  async deleteEntry(id:number, userId:number) {
    const sql = "UPDATE entries SET deleted=NOW() WHERE id = ? AND user_id = ?";
    return await this.db.query(sql, [id, userId]);
  }
}