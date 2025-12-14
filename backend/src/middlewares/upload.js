const multer = require('multer');
const path = require('path');
const fs = require('fs');

// cria pastas caso não existam
const baseDir = path.join(__dirname, '../../uploads');
const mangaDir = path.join(baseDir, 'manga');
const novelDir = path.join(baseDir, 'novel');
const avatarDir = path.join(baseDir, 'avatars');

[mangaDir, novelDir, avatarDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// configuração de storage REAL (salva arquivos)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('🎯 Multer - Processando arquivo:', file.originalname);
    console.log('🎯 Multer - Campo:', file.fieldname);
    console.log('🎯 Multer - Mimetype:', file.mimetype);
    console.log('🎯 Multer - Headers:', req.headers['content-type']);

    let folder = baseDir;

    if (req.baseUrl.includes('/mangas')) {
      folder = mangaDir;
    } else if (req.baseUrl.includes('/novels')) {
      folder = novelDir;
    } else if (req.baseUrl.includes('/auth') || req.baseUrl.includes('/user')) {
      folder = avatarDir;
    }

    console.log('🎯 Multer - Pasta destino:', folder);
    cb(null, folder);
  },

  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = unique + path.extname(file.originalname);
    console.log('🎯 Multer - Nome do arquivo:', filename);
    cb(null, filename);
  }
});

// filtro de tipos
const fileFilter = (req, file, cb) => {
  console.log('🎯 Multer - FileFilter - Campo:', file.fieldname);
  console.log('🎯 Multer - FileFilter - Arquivo:', file.originalname);
  
  const allowed = /jpeg|jpg|png|gif|webp/;
  const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowed.test(file.mimetype);

  if (extOk && mimeOk) {
    console.log('🎯 Multer - Arquivo aceito');
    return cb(null, true);
  }

  console.log('🎯 Multer - Arquivo rejeitado');
  cb(new Error("Arquivo inválido"));
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});