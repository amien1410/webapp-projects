const { Admin } = require("../../models");
const jwt = require("jsonwebtoken")

async function checkAdminAndCreate() {
    try {
        const isAdmin = await Admin.findOne({ where: { admin_id: 1 } })
        if(isAdmin){
            return
        }
        else{
            await Admin.create({
                user_id:1,
                admin_email:"demo@whoxa.com",
                admin_name:"Admin",
                admin_password:"Admin@123",
                profile_pic:"uploads/avtars/Admin.png"
            })
        }
    }
    catch (err) {
        console.error(err); 
        // res.status(501).json({ error: "Error in fetching AppFlow data" });
    }
}

async function loginAdmin(req, res) {
    try {
        const { admin_email, admin_password } = req.body

        const adminToken = await Admin.findOne({
            where: { admin_email, admin_password },
            attributes: ['admin_id']
        });

        const isAdmin = await Admin.findOne({
            where: { admin_email, admin_password },
            attributes: { exclude: ['admin_password'] }
        });

        if (isAdmin) {
            adminToken.dataValues.user_id = 1
            const token = jwt.sign(adminToken.dataValues, process.env.JWT_SECRET_KEY);
            res.status(201).json({ status: true, message: "Login sucessfull", token, isAdmin })
        }
        else {
            res.status(404).json({ message: "Admin not Exist" })
        }

    }
    catch (err) {
        console.error(err);
        res.status(501).json({ error: "Error in login with email" })
    }
}

module.exports = { loginAdmin, checkAdminAndCreate  }