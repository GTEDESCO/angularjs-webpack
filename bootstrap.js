const dotenv = require('dotenv');

let path = '.env';
if (process.env.NODE_ENV === 'production') {
  path = '.env.production';
}

const config = dotenv.config({ path });

module.exports = config.parsed;
