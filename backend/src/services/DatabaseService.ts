import * as mysql from 'mysql';

type DatabaseServiceOptions = {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number|undefined;
}

export class DatabaseService {
  private _pool: mysql.Pool;

  constructor(options:DatabaseServiceOptions) {
    this._pool = mysql.createPool({...options, connectionLimit: 10, charset: "utf8mb4" });
  }

  public query(sql:string, values:any) {
    return query(this.pool, sql, values);
  }

  public queryAll(queries:{sql:string, values:any}[]) {
    return new Promise<any[]>((resolve, reject) => {
      this.pool.getConnection(async (err, conn) => {
        if(err)
          reject(err);

        let results:any[] = [];
        try {
          for(const q of queries) {
            results.push(await query(conn, q.sql, q.values));
          }
        }
        catch(err) {
          reject(err);
        }
        finally {
          conn.release();
        }
        
        resolve(results);
      });
    })
  }

  get pool() {
    return this._pool;
  }

  endConnection() {
    this._pool.end(err => { throw err; });
  }
}

function query(conn:mysql.Pool|mysql.Connection, sql:string, values:any) {
  return new Promise<any>((resolve, reject) => {
    conn.query(sql, values, (err, result) => {
      if(err)
        reject(err);
      
      resolve(result);
    });
  })
}
