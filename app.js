// Importar dotenv
const dotenv = require('dotenv')
dotenv.config()

// Importar módulo express
const express = require('express')

// Importar módulo mysql2
const mysql = require('mysql2')

// App
const app = express()

// Adicionar bootstrap

app.use('/bootstrap', express.static('./node_modules/bootstrap/dist'))

// Importar módulo express-handlebars
const { engine } = require('express-handlebars')

// Configuração do express-handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

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

// Rota teste
app.get('/', function(req, res){
    res.render('formulario')
})

// Servidor
app.listen(8080)