const express = require('express');
const helmet = require('helmet');
const knex = require('knex');

const knexConfig = {
  client: 'sqlite3',
  connection: {
    filename: './data/lambda.sqlite3'
  },
  useNullAsDefault: true,
}

const db = knex(knexConfig);


const server = express();

server.use(express.json());
server.use(helmet());

// endpoints here

const errors = {
  '19': 'Another record with that value exists',
};



server.get('/api/zoos', async (req, res) => {
  try {
    const zoos = await db('zoos');
    res.status(200).json(zoos);
  }
  catch(err) {
    res.status(500).json(err)
  }
});

server.get('/api/zoos/:id', async (req, res) => {
  try {
    const zoo = await db('zoos')
      .where({id: req.params.id})
      .first();
    res.status(200).json(zoo)
  }
  catch(err) {
    console.log(err)
    res.status(500).json(err)
  }
});

server.post('/api/zoos', async (req, res) => {
  try {
    const [id] = await db('zoos').insert(req.body)
    
    const zoo = await db('zoos')
    .where({ id })
    .first()
    res.status(201).json(zoo)
  }
  catch(err) {
    const message = errors[err.errno] || 'There was an error.'
    res.status(500).json(message)
  }
});

server.put('/api/zoos/:id', async (req, res) => {
  try {
    const count = await db('zoos')
      .where({ id: req.params.id })
      .update(req.body)
    if(count > 0) {
      const zoo = await db('zoos')
        .where({ id: req.params.id })
        .first()
      res.status(200).json(zoo)
    } else {
      res.status(404).json({message: 'Zoo not found'})
    }
  }
  catch(err) {
    res.status(500).json(err)
  }
});
const port = 3300;
server.listen(port, function() {
  console.log(`\n=== Web API Listening on http://localhost:${port} ===\n`);
});
