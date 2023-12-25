import knex from 'knex';
import 'dotenv/config';

const { DB_ENDPOINT, DB_PORT, DB_DB, DB_USER, DB_PASSWORD } = process.env;

const config = {
  endpoint: DB_ENDPOINT,
  port: Number(DB_PORT),
  database: DB_DB,
  user: DB_USER,
  password: DB_PASSWORD,
};

export default knex({
  client: 'pg',
  connection: config,
});
