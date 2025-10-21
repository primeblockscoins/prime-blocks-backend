import multer from "multer";
import path from "path";

const storage = multer.memoryStorage(); // keep file in memory for Supabase upload

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only image/pdf files allowed!"));
    }
  },
});

export default upload;
