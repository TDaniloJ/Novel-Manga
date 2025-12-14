// models/index.js - ATUALIZADO
const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig);

const db = {
  sequelize,
  Sequelize,
};

// Importar models
db.User = require('./User')(sequelize, Sequelize);
db.Manga = require('./Manga')(sequelize, Sequelize);
db.Novel = require('./Novel')(sequelize, Sequelize);
db.MangaChapter = require('./MangaChapter')(sequelize, Sequelize);
db.NovelChapter = require('./NovelChapter')(sequelize, Sequelize);
db.MangaPage = require('./MangaPage')(sequelize, Sequelize);
db.Genre = require('./Genre')(sequelize, Sequelize);
db.Favorite = require('./Favorite')(sequelize, Sequelize);
db.ReadingHistory = require('./ReadingHistory')(sequelize, Sequelize);
db.Comment = require('./Comment')(sequelize, Sequelize);
db.Session = require('./Session')(sequelize, Sequelize); // ✅ NOVO

// Definir associações
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;