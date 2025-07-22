const express = require('express');
const multer = require('multer');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Configurações
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Criar pasta de vídeos se não existir
const videoDir = path.join(__dirname, 'public/videos');
if (!fs.existsSync(videoDir)) {
  fs.mkdirSync(videoDir, { recursive: true });
}

// Configuração do multer
const upload = multer({ dest: 'public/videos/' });

// Ler vídeos já enviados
let videos = [];
const dbFile = 'uploads.json';

if (fs.existsSync(dbFile)) {
  videos = JSON.parse(fs.readFileSync(dbFile));
}

// Rotas
app.get('/', (req, res) => {
  res.render('index', { videos });
});

app.get('/upload', (req, res) => {
  res.render('upload');
});

app.post('/upload', upload.single('video'), (req, res) => {
  const { title, description } = req.body;
  const filename = req.file.filename;

  const newVideo = {
    id: Date.now(),
    title,
    description,
    filename
  };

  videos.unshift(newVideo);
  fs.writeFileSync(dbFile, JSON.stringify(videos, null, 2));
  res.redirect('/');
});

app.get('/watch/:id', (req, res) => {
  const video = videos.find(v => v.id == req.params.id);
  if (!video) return res.send('Vídeo não encontrado');
  res.render('watch', { video });
});

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));