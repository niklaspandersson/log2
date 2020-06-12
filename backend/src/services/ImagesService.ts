import { DatabaseService } from "./DatabaseService";
import { Image } from "../models/image";

export class ImagesService {
  private db: DatabaseService;

  constructor(databaseService: DatabaseService) {
    this.db = databaseService;
  }

  async getImagesByEntryId(entryId:number):Promise<Image[]> {
    const sql = `SELECT * FROM images WHERE entry_id = ?`;
    return await this.db.query(sql, [entryId]);
  }
  async createImage(image:Image):Promise<Image> {
    const dbRes = await this.db.query('INSERT INTO images SET ?', [image]);
    return {...image, id: dbRes.insertId as number };
  }
}