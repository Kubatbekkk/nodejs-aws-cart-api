import knex from 'knex';
require('dotenv').config();

const { PG_ENDPOINT, PG_PORT, PG_DB, PG_USER, PG_PASSWORD } = process.env;

const config = {
  host: PG_ENDPOINT,
  port: Number(PG_PORT),
  database: PG_DB,
  user: PG_USER,
  password: PG_PASSWORD,
  ssl: {
    rejectUnauthorized: false, // Add this line to disable certificate authority checks
  },
};

export default knex({
  client: 'pg',
  connection: config,
});
