import { Request, Response, NextFunction } from 'express'
import multer, { FileFilterCallback } from 'multer'
import { join } from 'path'
import fs from 'fs'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'
import {
    MAX_FILE_SIZE,
    MIN_FILE_SIZE,
    ALLOWED_MIME_TYPES,
    MIN_IMAGE_WIDTH,
    MIN_IMAGE_HEIGHT,
} from '../config'

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(
            null,
            join(
                __dirname,
                process.env.UPLOAD_PATH_TEMP
                    ? `../public/${process.env.UPLOAD_PATH_TEMP}`
                    : '../public'
            )
        )
    },
    filename: (_req, file, cb) => {
        const uniqueName = `${uuidv4()}-${Date.now()}${file.originalname.substring(file.originalname.lastIndexOf('.'))}`
        cb(null, uniqueName)
    },
})

const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return cb(null, false)
    }
    cb(null, true)
}

const fileSizeCheck = (req: Request, res: Response, next: NextFunction) => {
    if (req.file) {
        const fileSize = req.file.size
        if (fileSize < MIN_FILE_SIZE) {
            return res.status(400).send({
                message:
                    'Размер файла слишком мал. Минимальный размер файла — 2 КБ.',
            })
        }
        if (fileSize > MAX_FILE_SIZE) {
            return res.status(400).send({
                message:
                    'Размер файла слишком велик. Максимальный размер файла — 10 МБ.',
            })
        }
    }
    next()
}

const imageDimensionsCheck = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Файл не загружен' })
    }

    try {
        const image = sharp(req.file.path)
        const metadata = await image.metadata()

        if (
            metadata.width! < MIN_IMAGE_WIDTH ||
            metadata.height! < MIN_IMAGE_HEIGHT
        ) {
            fs.unlinkSync(req.file.path)
            return res.status(400).json({
                message: `Минимальные размеры изображения: ${MIN_IMAGE_WIDTH}x${MIN_IMAGE_HEIGHT}px`,
            })
        }

        next()
    } catch (error) {
        return res.status(500).json({ message: 'Ошибка обработки изображения' })
    }
}
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE },
})
export default { upload, fileSizeCheck, imageDimensionsCheck }
