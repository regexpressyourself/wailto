const {Pool, Client} = require('pg');

const pool = new Pool({
  user: 'zookeeprr',
  host: 'localhost',
  database: 'wailto',
  password: '',
  port: 5432,
});

const client = new Client({
  user: 'zookeeprr',
  host: 'localhost',
  database: 'wailto',
  password: '',
  port: 5432,
});

client.connect();

exports.client = client;
