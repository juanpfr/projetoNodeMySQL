// Importar dotenv
const dotenv = require('dotenv')
dotenv.config()

// Importar módulo express
const express = require('express')

// Importar módulo fileupload
const fileupload = require('express-fileupload')

// Importar módulo mysql2
const mysql = require('mysql2')

// App
const app = express()

// Habilitando o upload de arquivos
app.use(fileupload())

// Adicionar bootstrap
app.use('/bootstrap', express.static('./node_modules/bootstrap/dist'))

// Adicionar CSS próprio
app.use('/css', express.static('./css'))

// Importar módulo express-handlebars
const { engine } = require('express-handlebars')

// Configuração do express-handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

// Manipulação de dados via rotas
app.use(express.json())
app.use(express.urlencoded({extended:false}))


// Configuração de conexão
const conexao = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})

// Teste de conexão
conexao.connect(function(erro){
    if(erro) throw erro
    console.log('Conexão efetuada com sucesso!')
})

// Rota principal
app.get('/', function(req, res){
    res.render('formulario')
})

// Rota de cadastro
app.post('/cadastrar', function(req, res){
    console.log(req.body)
    console.log(req.files.imagem.name)

    req.files.imagem.mv(__dirname + '/img/' + req.files.imagem.name)                           // a função mv() serve para mover arquivos
    res.end()
})

// Servidor
app.listen(8080)