import { DatabaseService } from "./DatabaseService";
import {User} from "../models/user";

export class UserService {
  private db: DatabaseService;

  constructor(db: DatabaseService) {
    this.db = db;
  }

  public async getUserById(id: number) {
    const sql = "SELECT google_id from users WHERE id = ?";
    const result = await this.db.query(sql, id);

    return (result && result[0]) 
      ? { id, googleId: result[0].google_id } as User
      : null;
  }

  public async getUserByGoogleId(googleId: string) {
    const sql = "SELECT id from users WHERE google_id = ?";
    const result = await this.db.query(sql, googleId);

    return (result && result[0]) 
      ? { id: result[0].id, googleId } as User
      : null;
  }

  public async createUser(googleId:string) {
    const sql = "INSERT INTO users SET google_id = ?";
    await this.db.query(sql, googleId);
    return (await this.getUserByGoogleId(googleId))!;
  }
}