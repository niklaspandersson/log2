import * as express from "express";
import multer from "multer";
import { DatabaseService } from "../services/DatabaseService";
import { EntriesService } from "../services/EntriesService";
import { AuthService, AuthTokenPayload } from "../services/AuthService";
import { Entry } from "../models/entry";
import { Image } from "../models/image";

export function entriesApi(db:DatabaseService, auth:AuthService) {
  const service = new EntriesService(db);

  const router = express.Router();
  router.use(auth.authMiddleware);
  router.route('/')
    .get(async (req, res) => {
      const auth:AuthTokenPayload = res.locals.auth;
      const user_id = auth?.user?.id;
      res.json(await service.getEntriesByUserId(user_id, req.query['year'] as number|undefined, req.query['month'] as number|undefined));
    })
    .post(async (req, res) => {
      const auth:AuthTokenPayload = res.locals.auth;
      const uid = auth?.user?.id;
      const entry = req.body as Entry | undefined;

      if(!entry)
        res.sendStatus(400);
      else if(!uid)
        res.sendStatus(401);
      else {
        const partialEntry:Entry = { 
          user_id: uid, 
          id: entry.id,
          title: entry.title, 
          text: entry.text,
          date: new Date(entry.date)
        };
  
        const dbRes = await service.createEntry(partialEntry);
        res.json(dbRes);
      }
    });
  
  router.route('/:id')
    .patch(async (req, res) => {
      const auth:AuthTokenPayload = res.locals.auth;
      const uid = auth.user.id;
      const entry = req.body as Entry;

      if(!entry)
        res.sendStatus(400);
      else if(!uid || uid !== entry?.user_id) {
        res.sendStatus(401);
        return;
      }

      if(entry.id) {
        const partialEntry:Partial<Entry> = { 
          id: parseInt(req.params.id), 
          user_id: uid, 
          title: entry.title, 
          text: entry.text
        };

        const dbRes = await service.updateEntry(partialEntry);
        res.json(dbRes);
      }
      else
        res.sendStatus(400);
    })

    .delete(async (req, res) => {
      const auth:AuthTokenPayload = res.locals.auth;
      const user_id = auth.user.id;

      if(!user_id)
        res.sendStatus(401);
      else {
        const id = parseInt(req.params.id);

        const dbRes = await service.deleteEntry(id, user_id);
        res.json(dbRes);
      }
    });

    router.route('/:id/images')
      .get(async (req, res) => {
        console.log("getting all images for entry with id " + parseInt(req.params.id))

      })
      .post(async (req, res) => {
        console.log("creating image for entry with id " + parseInt(req.params.id))
      });

  return router;
}