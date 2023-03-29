const mysql = require('mysql2');
const fs = require('fs');
const util = require('util');
const stripe = require('stripe')("sk_test_51JI7vYCKBsnT4WzX7tNPNL5BpxcjyIzIeWBRwZJzLEQ44Ninl3cBz9RxXNtrVCplrs8FuZP2mq5cAjTShbqb6IBe00pu45CTgH")




const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'production_unclean'
});

/**
 * @NOTE Only to make the query function support async await
 */
const query = util.promisify(connection.query).bind(connection);




/**
 * @NOTE the prupose of these delay function is to wait for 7secs after making a call to stripe API
 * Stripe throws rate limmiter error if you hit there server multiple time within 5secs
 * @param chefID Integer
 */
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
await delayCreatingCustomer()
}



/**
 * @NOTE the prupose of these delay function is to wait for 7secs after making a call to stripe API
 * Stripe throws rate limmiter error if you hit there server multiple time within 5secs
 *  @param chefID Integer
 */
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

exports.query = query;

/**
 * @NOTE
 * All the promises here are running concurrently instead of parallel using multi threading way. As I dont have much data so the entire code can work fine with
 * Concurrent programming. But incase of more data we can convert the code to multi threading 
 */


(async () => {
  try {
    
    const fetch = require('./fetchingQueries')
    const updateObject = require('./updateQueries')
    const utils = require('./utils')

    let data = await fetch.email()
    let emailsArray = utils.replaceEmailByYopmail(data);

    if (utils.checkDuplication(emailsArray)) throw new Error("Duplication in email if found before executing it in database...... ❌❌❌❌")


    Promise.allSettled(emailsArray.map(async (item) => {
      await updateObject.updateInDatabase(item)
    })).then((res) => { console.log('donw with updating email') }).catch((e) => { console.log("some issue with updating email in database") })


    const hash = utils.encryptAES('123456789');
    let userIds = await fetch.ids();

    Promise.allSettled(userIds.map(async (item) => {
      await updateObject.updatePasswordInDatabase(item.id, hash)
    })).then((res) => { console.log("done with updating password") }).catch((e) => { console.log("some issue with updating email in database") })


    Promise.allSettled(userIds.map(async (item) => {
      await updateObject.updatePhoneNumbersInDatabase(item.id, "+447700900077")
    })).then((res) => { console.log("done with updating phone number") }).catch((e) => { console.log("some issue with updating phone number in database") })


    

    const chefIds = await fetch.getChefsFromChefTable()
   
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