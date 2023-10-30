const express = require('express');
const sqlite3 = require('sqlite3');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors')
const session = require('express-session');

const app = express();
const port = 3000;

app.use(cors())
app.use(express.json());




app.use(session({
  secret: '123',
  resave: false,
  saveUninitialized: true
}));

const authenticateUser = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ error: 'Неавторизованный' });
  }
};
const db = new sqlite3.Database('files.db');
db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT)');
  db.run('CREATE TABLE IF NOT EXISTS files (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)');
});


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

app.post('/upload', upload.single('file'),(req, res) => {
  const file = req.file;

  db.run('INSERT INTO files (name) VALUES (?)', [file.originalname], function(err) {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    } else {
      res.json({ message: 'Файл успешно загружен' });
    }
  });
});

app.get('/download/:filename',  (req, res) => {
  const fileName = req.params.filename;

  db.get('SELECT name FROM files WHERE name = ?', [fileName], (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    } else if (!row) {
      res.status(404).json({ error: 'Файл не найден' });
    } else {
      const filePath = path.join(__dirname, 'uploads', row.name);

      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'Внутренняя ошибка сервера' });
        } else {
          res.download(filePath, row.name, (err) => {
            if (err) {
              console.error(err);
              res.status(500).json({ error: 'Внутренняя ошибка сервера' });
            }
          });
        }
      });
    }
  });
});

app.get('/files', (req, res) => {
  db.all('SELECT name FROM files', (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    } else {
      res.json(rows);
    }
  });
});

const hashPassword = async (password) => {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  return hash;
};

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await hashPassword(password);
  
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Внутренняя ошибка сервера'});
      } 
      else {
        req.session.user = username; 
        res.json({ message: 'Пользователь успешно зарегистрировался'});
      }
    });
  });
  
  app.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    db.get('SELECT password FROM users WHERE username = ?', [username], async (err, row) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Внутренняя ошибка сервера'});
      } else if (!row) {
        res.status(401).json({ error: 'Неверное имя пользователя или пароль'});
      } else {
        const hashedPassword = row.password;
        const match = await bcrypt.compare(password, hashedPassword);
        
        if (match) {
          req.session.user = username;
          res.json({ message: 'Аутентификация прошла успешно'});
        } else {
          res.status(401).json({ error: 'Неверное имя пользователя или пароль'});
        }
      }
    });
  });
  


app.listen(port, () => {
  console.log(`Сервер был запущен на ${port} порте.`);
});