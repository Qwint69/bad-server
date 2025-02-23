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

const checkImageMetadata = async (
    filePath: string
): Promise<sharp.Metadata> => {
    try {
        const metadata = await sharp(filePath).metadata()
        return metadata
    } catch (error) {
        console.error('Ошибка чтения метаданных изображения:', error)
        throw new Error('Недопустимый файл изображения')
    }
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
        const metadata = await checkImageMetadata(req.file.path)
        const { width = 0, height = 0 } = metadata
        if (width < MIN_IMAGE_WIDTH || height < MIN_IMAGE_HEIGHT) {
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
})
export default { upload, fileSizeCheck, imageDimensionsCheck }
