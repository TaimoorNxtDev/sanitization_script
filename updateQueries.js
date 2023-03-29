const { query } = require("./script");
module.exports = {

    updateInDatabase: async (emailObject) => {
        try {
            await query(`UPDATE users SET email = '${emailObject.changedEmail}' WHERE email  = '${emailObject.originalEmail}';`)

        } catch (error) {
            console.log('Exception in updating in database', error)
        }
    },

    updatePasswordInDatabase: async (id, hash) => {
        try {
            await query(`UPDATE users SET password = '${hash}' WHERE id  = '${id}';`)

        } catch (error) {
            console.log('Exception in updating password in database', error)
        }

    },

    updatePhoneNumbersInDatabase: async (id, phoneNumber) => {
        try {
            await query(`UPDATE phone_numbers SET national_number = '${phoneNumber}' WHERE user_id  = '${id}';`)

        } catch (error) {
            console.log('Exception in updating phone number in database', error)

        }
    }
}

