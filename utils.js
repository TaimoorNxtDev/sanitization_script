const { AES } = require("crypto-js")

module.exports = {
 replaceEmailByYopmail: (emailArray) => {
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
    },

    checkDuplication: (values) => {
        const uniqueValues = new Set(values.map(v => v.changedEmail));
        if (uniqueValues.size < values.length) return true
        else return false
    },

    encryptAES: (text) => {
        try {

            const encryptedHash = AES.encrypt(text, "xuHSYUmyJAHxWrNR").toString()
            return encryptedHash
        } catch (error) {
            console.log('error', error)
        }
    }

}

