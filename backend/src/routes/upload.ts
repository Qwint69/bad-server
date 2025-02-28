import { Router } from 'express';
import { uploadFile } from '../controllers/upload';
import fileMiddleware from '../middlewares/file';
import { v4 as uuidv4 } from 'uuid';

const uploadRouter = Router();

uploadRouter.post(
  '/',
  fileMiddleware.upload.single('file'),
  (req, res, next) => {
    if (req.file) {
      const fileExtension = req.file.originalname.split('.').pop();
      req.file.filename = `${uuidv4()}-${Date.now()}.${fileExtension}`;
    }
    next();
  },
  fileMiddleware.fileSizeCheck,
  fileMiddleware.imageDimensionsCheck,
  uploadFile
);

export default uploadRouter;
