import * as express from "express";
import multer from "multer";
import { DatabaseService } from "../services/DatabaseService";
import { EntriesService } from "../services/EntriesService";
import { ImagesService } from "../services/ImagesService";
import { AuthService, AuthTokenPayload } from "../services/AuthService";
import { Entry } from "../models/entry";
import { Image } from "../models/image";
import * as config from "../config";
import path from "path";

const storage = multer.diskStorage({
  destination: (req,file,cb) => {
    cb(null, config.IMAGE_PATH);
  },
  filename: (req,file,cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`)
  }
})
const upload = multer({ storage })

export function entriesApi(db:DatabaseService, auth:AuthService) {
  const service = new EntriesService(db);
  const imagesService = new ImagesService(db);

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
        const auth:AuthTokenPayload = res.locals.auth;
        const user_id = auth.user.id;
        const id = parseInt(req.params.id);

        if(!user_id || !service.checkEntryUserId(id, user_id))
          res.sendStatus(401);
        else {
          const dbRes = await imagesService.getImagesByEntryId(id);
          console.log("getting all images for entry with id " + parseInt(req.params.id))
          res.json(dbRes);
        }
      })
      .post(upload.single('image'), async (req, res) => {
        const auth:AuthTokenPayload = res.locals.auth;
        const user_id = auth.user.id;
        const id = parseInt(req.params.id);

        if(!user_id || !service.checkEntryUserId(id, user_id))
          res.sendStatus(401);
        else {
          const image:Image = {
            filename: req.file.filename,
            entry_id: id
          };
  
          const dbRes = await imagesService.createImage(image);
          console.log("creating image for entry with id " + id)
          res.json(dbRes);
        }
      });

  return router;
}