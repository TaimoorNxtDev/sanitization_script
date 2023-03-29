const { query } = require("./script");
module.exports = {
    email: async () => {
        let rows = await query('SELECT email FROM production_unclean.users')
        return rows;
    },

    ids: async () => {
        let rows = await query('SELECT id FROM production_unclean.users')
        return rows;
    },

    getUserWithRoleID: async (role_id) => {
        let rows = await query(`SELECT id FROM production_unclean.users where user_role = '${role_id}'`)
        return rows;

    },


    getChefsFromChefTable: async () => {
        let rows = await query(`SELECT id FROM production_unclean.chefs`)
        return rows;

    }



}

