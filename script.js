const mysql = require('mysql2');
const fs = require('fs');
const util = require('util');
const stripe = require('stripe')("sk_test_51JI7vYCKBsnT4WzX7tNPNL5BpxcjyIzIeWBRwZJzLEQ44Ninl3cBz9RxXNtrVCplrs8FuZP2mq5cAjTShbqb6IBe00pu45CTgH")

const { AES } = require("crypto-js")


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

let ids = async () => {
  let rows = await query('SELECT id FROM production_unclean.users')
  return rows;
}



const replaceEmailByYopmail = (emailArray) => {
  let allChangedEmails = []
  let someRandomNumbers = 0
  let changedEmail = emailArray.map((emailObject) => {
    let yopmailEmail = emailObject.email.split('@')[1].replace(/[\w.]+[a-z]+\.[a-z]{2,}/gi, 'yopmail.com')
    let changedEmail = (emailObject.email.split('@')[0] + '@' + yopmailEmail).toLocaleLowerCase()

    if (!allChangedEmails.includes(changedEmail)) {
      allChangedEmails.push(changedEmail)
      return {
        originalEmail: emailObject.email,
        changedEmail
      }
    }
    else {

      someRandomNumbers = Math.floor(Math.random() * 10000);
      changedEmail = emailObject.email.split('@')[0] + someRandomNumbers + '@' + yopmailEmail
      allChangedEmails.push(changedEmail)
      return {
        originalEmail: emailObject.email,
        changedEmail
      }
    }
  })

  return changedEmail
}

let checkDuplication = (values) => {
  const uniqueValues = new Set(values.map(v => v.changedEmail));
  if (uniqueValues.size < values.length) return true
  else return false
}

const updateInDatabase = async (emailObject) => {
  try {
    await query(`UPDATE users SET email = '${emailObject.changedEmail}' WHERE email  = '${emailObject.originalEmail}';`)

  } catch (error) {
    console.log('Exception in updating in database', error)
  }
}

const updatePasswordInDatabase = async (id, hash) => {
  try {
    await query(`UPDATE users SET password = '${hash}' WHERE id  = '${id}';`)

  } catch (error) {
    console.log('Exception in updating password in database', error)
  }

}

const updatePhoneNumbersInDatabase = async (id, phoneNumber) => {
  try {
    await query(`UPDATE phone_numbers SET national_number = '${phoneNumber}' WHERE user_id  = '${id}';`)

  } catch (error) {
    console.log('Exception in updating phone number in database', error)

  }
}




const getUserWithRoleID = async (role_id) => {
  let rows = await query(`SELECT id FROM production_unclean.users where user_role = '${role_id}'`)
  return rows;

}


const getChefsFromChefTable = async () => {
  let rows = await query(`SELECT id FROM production_unclean.chefs`)
  return rows;

}

const encryptAES = (text) => {
  try {

    const encryptedHash = AES.encrypt(text, "xuHSYUmyJAHxWrNR").toString()
    return encryptedHash
  } catch (error) {
    console.log('error', error)
  }
}


const delayCreatingCustomer = async (chefID) => {
  try {
    return new Promise((resolve, reject) => setTimeout(async () => {
      const account = await stripe.customers.create({
        name: body.name,
        email: body.email,
        phone: body.phone,
      });

      await query(`UPDATE chefs SET stripe_chef_id = '${account.id}', addressline1='123 High Street, London SW1A 1AA, United Kingdom' WHERE id  = ${chefID};`)
      resolve("DONE")
    }, 7000)).catch((e) => reject(e));

  } catch (error) {
    reject('Rejected Promise')
    console.log(error)
  }

}

const createCustomers = async(customerID) => {
  

  delayCreatingCustomer()
}

const delayTime = async (chefID) => {
  try {
    return new Promise((resolve, reject) => setTimeout(async () => {
      const account = await stripe.accounts.create({
        country: 'GB',
        type: 'standard',
        
      });

      await query(`UPDATE chefs SET stripe_chef_id = '${account.id}', addressline1='123 High Street, London SW1A 1AA, United Kingdom' WHERE id  = ${chefID};`)
      resolve("DONE")
    }, 7000)).catch((e) => reject(e));

  } catch (error) {
    reject('Rejected Promise')
    console.log(error)
  }

}

const createStripeCustomerAndSavetoDB = async (chefID) => {
  try {

    await delayTime(chefID)


  } catch (error) {
    console.log('error', error)

  }


}



(async () => {
  try {
    let data = await email()
    let emailsArray = replaceEmailByYopmail(data);

    if (checkDuplication(emailsArray)) throw new Error("Duplication in email if found before executing it in database...... ❌❌❌❌")

    Promise.allSettled(emailsArray.map(async (item) => {
      await updateInDatabase(item)
    })).then((res) => { console.log('donw with updating email') }).catch((e) => { console.log("some issue with updating email in database") })


    const hash = encryptAES('123456789');
    let userIds = await ids();

    Promise.allSettled(userIds.map(async (item) => {
      await updatePasswordInDatabase(item.id, hash)
    })).then((res) => { console.log("done with updating password") }).catch((e) => { console.log("some issue with updating email in database") })


    Promise.allSettled(userIds.map(async (item) => {
      await updatePhoneNumbersInDatabase(item.id, "+447700900077")
    })).then((res) => { console.log("done with updating phone number") }).catch((e) => { console.log("some issue with updating phone number in database") })


    

    const chefIds = await getChefsFromChefTable()
   
    // for (let index = 0; index < chefIds.length; index++) {
    //   await createStripeCustomerAndSavetoDB(chefIds[index].id)
    // }


  } catch (error) {
    console.error('Error sanitizing DB-Dump:', error);
  } finally {
    connection.end();
  }
})();



// image  https://cheffieimages.s3.eu-west-2.amazonaws.com/prod/173/2d4g4cf4.blob
// stripe_chef_id
// title
// addressline1
// addressline2






//pipeLineAsync