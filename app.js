// Importar módulo express
const express = require('express')

// App
const app = express()

// Rota teste

app.get('/', function(req, res){
    res.write('teste')
    res.end()
})

// Servidor
app.listen(8080)