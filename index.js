const mysql = require('mysql2');
const fs = require('fs');
const { pipeline } = require('stream');
const { promisify } = require('util');
const { Transform } = require('stream');
const path = require('path');

// Create a connection to the database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'dev_db'
});

// Replace email addresses with fake ones
const emailTransform = new Transform({
  transform(chunk, encoding, callback) {
      const data = chunk.toString();
      console.log(data)
    const sanitizedData = data.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/g, (_, p1) => `user${Math.floor(Math.random() * 1000)}@yopmail.com`);
    callback(null, sanitizedData);
  }
});

// Replace phone numbers with fake ones
// const phoneTransform = new Transform({
//   transform(chunk, encoding, callback) {
//     const data = chunk.toString();
//     const sanitizedData = data.replace(/\d{10}/g, '555-xxxx');
//     callback(null, sanitizedData);
//   }
// });

// Remove credit card information
// const creditCardTransform = new Transform({
//   transform(chunk, encoding, callback) {
//     const data = chunk.toString();
//     const sanitizedData = data.replace(/(\d{4}-){3}\d{4}/g, 'xxxxxxxxxxxx');
//     callback(null, sanitizedData);
//   }
// });

// Remove social security numbers
// const ssnTransform = new Transform({
//   transform(chunk, encoding, callback) {
//     const data = chunk.toString();
//     const sanitizedData = data.replace(/\d{3}-\d{2}-\d{4}/g, 'xxx-xx-xxxx');
//     callback(null, sanitizedData);
//   }
// });

// Set all passwords to a default value
const passwordTransform = new Transform({
  transform(chunk, encoding, callback) {
    const data = chunk.toString();
    const sanitizedData = data.replace(/password/g, 'default_password');
    callback(null, sanitizedData);
  }
});

// Anonymize names
const nameTransform = new Transform({
  transform(chunk, encoding, callback) {
    const data = chunk.toString();
    const sanitizedData = data.replace(/([A-Z][a-z]+) ([A-Z][a-z]+)/g, (_, p1, p2) => `User${Math.floor(Math.random() * 1000)} Number${Math.floor(Math.random() * 1000)}`);
    callback(null, sanitizedData);
  }
});

// Create a pipeline to read the DB-Dump file, sanitize it, and write it to a new file
const pipelineAsync = promisify(pipeline);
(async () => {
  try {
   let sqlFilePath =  path.join(__dirname , './abc.sql')

    await pipelineAsync(
      fs.createReadStream(sqlFilePath),
      emailTransform,
      passwordTransform,
      nameTransform,
      fs.createWriteStream('sanitized_db_dump.sql' , 'utf-8')
    );
    console.log('DB-Dump sanitized successfully');
  } catch (error) {
    console.error('Error sanitizing DB-Dump:', error);
  } finally {
    connection.end();
  }
})();
