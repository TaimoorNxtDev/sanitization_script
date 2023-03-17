const mysql = require('mysql2');
const fs = require('fs');
const util = require('util');
const { execArgv } = require('process');


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'production_unclean'
});


const query = util.promisify(connection.query).bind(connection);
let email = async () => {
    let rows = await query('SELECT email FROM production_unclean.users')
    return rows;
}

const replaceEmailByYopmail = (emailArray) =>{
   let changedEmail =  emailArray.map((emailObject)=>{
        let yopmailEmail  =emailObject.email.split('@')[1].replace(/[\w.]+[a-z]+\.[a-z]{2,}/gi, 'yopmail.com')
        return {
            originalEmail : emailObject.email , 
            changedEmail : emailObject.email.split('@')[0] + '@' + yopmailEmail

        }
    })
    return changedEmail;
}


(async () => {
    try {
       let data = await email()
       let yopmailResult = replaceEmailByYopmail(data);
       console.log(yopmailResult)

    } catch (error) {
      console.error('Error sanitizing DB-Dump:', error);
    } finally {
      connection.end();
    }
  })();
  