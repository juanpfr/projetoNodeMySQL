// Importar & configurar dotenv
const dotenv = require('dotenv')
dotenv.config()

// Importar módulo express
const express = require('express')

// Importar módulo fileupload
const fileupload = require('express-fileupload')

// Importar módulo mysql2
const mysql = require('mysql2')

// Importar módulo(nativo) File Systems
const fs = require('fs')

// App
const app = express()

// Habilitando o upload de arquivos
app.use(fileupload())

// Adicionar bootstrap
app.use('/bootstrap', express.static('./node_modules/bootstrap/dist'))

// Adicionar CSS próprio
app.use('/css', express.static('./css'))

// Referenciar a pasta de imagens
app.use('/img', express.static('./img'))

// Importar módulo express-handlebars
const { engine } = require('express-handlebars')

// Configuração do express-handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

// Manipulação de dados via rotas
app.use(express.json())
app.use(express.urlencoded({ extended: false }))


// Configuração de conexão
const conexao = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})

// Teste de conexão
conexao.connect(function (erro) {
    if (erro) throw erro
    console.log('Conexão efetuada com sucesso!')
})

// Rota principal
app.get('/', function (req, res) {
    // SQL
    let sql = "SELECT * FROM produtos"

    // Executar comandos SQL
    conexao.query(sql, function (erro, retorno) {
        res.render('formulario', { produtos: retorno, situacao: req.params.sutiacao })
    })
})

// Rota principal contendo a situação
app.get('/:situacao', function (req, res) {
    // SQL
    let sql = "SELECT * FROM produtos"

    // Executar comandos SQL
    conexao.query(sql, function (erro, retorno) {
        res.render('formulario', { produtos: retorno })
    })
})

// Rota de cadastro
app.post('/cadastrar', function (req, res) {
    try {
        // Obter os dados que serão utilizados para o cadastro
        let nome = req.body.nome
        let valor = req.body.valor
        let imagem = req.files.imagem.name

        // Validar nome e valor do produto
        if (nome == "" || valor == "" || isNaN(valor)) {
            res.redirect('/falhaCadastro')
        } else {
            // SQL
            let sql = `INSERT INTO produtos (nome, valor, imagem) VALUES ("${nome}", ${valor}, "${imagem}")`

            // Executar comando SQL
            conexao.query(sql, function (erro, retorno) {

                // Caso ocorra um erro
                if (erro) throw erro

                // Caso ocorra o cadastro
                // a função mv() serve para mover arquivos
                req.files.imagem.mv(__dirname + '/img/' + req.files.imagem.name)
                console.log(retorno)
            })

            // Redirecionar para o rota principal
            res.redirect('/okCadastro')
        }
    }
    catch (erro) {
        res.redirect('/falhaCadastro')
    }
})

// Rota para remover
app.get('/remover/:id&:imagem', function (req, res) {
    try {
        // SQL
        let sql = `DELETE FROM produtos WHERE id = ${req.params.id}`

        // Executar comando SQL
        conexao.query(sql, function (erro, retorno) {
            // Caso ocorra falha no SQL
            if (erro) throw erro

            // Caso funcione o SQL
            // fs.unlink() faz a remoção do arquivo
            fs.unlink(__dirname + '/img/' + req.params.imagem, (erro_imagem) => {
                console.log('Falha ao remover a imagem')
            })
        })

        // Redirecionamento
        res.redirect('/okRemover')
    }
    catch (erro) {
        res.redirect('falhaRemover')
    }
})

// Rota para redirecionar para o formulário de alteração
app.get('/formularioAlterar/:id', function (req, res) {
    // SQL
    let sql = `SELECT * FROM produtos WHERE id = ${req.params.id}`

    // Executar o comando SQL
    conexao.query(sql, function (erro, retorno) {
        // Caso ocorra falha
        if (erro) throw erro

        // Caso consiga executar comando SQL
        res.render('formularioAlterar', { produto: retorno[0] })
    })
})

// Rota para alterar produtos
app.post('/alterar', function (req, res) {
    // Obter os dados do formulário
    let id = req.body.id
    let nome = req.body.nome
    let valor = req.body.valor
    let nomeImagem = req.body.nomeImagem

    // Validar nome do produto e valor
    if (nome == "" || valor == "" || isNaN(valor)) {
        res.redirect('/falhaAlterar')
    } else {
        // Definir o tipo de alteração
        try {
            // Objeto de imagem
            let imagem = req.files.imagem

            // SQL
            let sql = `UPDATE produtos SET nome = "${nome}", valor = ${valor}, imagem = "${imagem.name}" WHERE id = ${id}`

            // Executar comando SQL
            conexao.query(sql, function (erro, retorno) {
                // Caso ocorra falha
                if (erro) throw erro

                // Remover imagem antiga
                fs.unlink(__dirname + '/img/' + nomeImagem, (erro_imagem) => {
                    console.log('Ouve um erro ao remover imagem antiga')
                })

                // Cadastrar nova imagem
                imagem.mv(__dirname + '/img/' + imagem.name)
            })
        }
        catch (erro) {
            // SQL
            let sql = `UPDATE produtos SET nome = "${nome}", valor = ${valor} WHERE id = ${id}`

            // Executar comando SQL
            conexao.query(sql, function (erro, retorno) {
                // Caso ocorra falha
                if (erro) throw erro
            })
        }

        // Redirecionar rota
        res.redirect('/okAlterar')
    }
})

// Servidor
app.listen(8080)