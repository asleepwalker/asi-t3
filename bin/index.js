const express = require('express');
const http = require('http');
const generator = require('./generator');

let app = express();
let server = http.createServer(app);

app.use(express.static('public'));
app.use('/vendor', express.static('node_modules'));

app.get('/api/transactions/:since/:till', function(req, res) {
	res.send(generator(req.params));
});

server.listen(3000, 'localhost');
server.on('listening', () => console.log('Server started at %s:%s',
	server.address().address, server.address().port));
