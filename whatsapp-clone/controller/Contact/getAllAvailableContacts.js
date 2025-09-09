const jwt = require("jsonwebtoken");
const { User, AllContact } = require("../../models");
const { Op, where } = require("sequelize");
let jwtSecretKey = process.env.JWT_SECRET_KEY;

const getAllAvailableContacts = async (req, res) => {
  let { contact_list } = req.body;

  // console.log(typeof contact_list);
  // console.log( contact_list);
  // let start_time = Date.now();
  const user_id = req.authData.user_id;
  try {
    // Check if the user already exists in database
    const userData = await User.findOne({
      where: { user_id },
    });

    // Create or update entry in AllContact of this user
    const contactDetail = await AllContact.findOne({
      where: {
        user_id: user_id,
        phone_number: userData.phone_number,
      },
    });
    // console.log("\x1b[34m", contactDetail, "contactDetail", "\x1b[0m");
    if (contactDetail) {
      await AllContact.update(
        { full_name: `${userData.first_name} ${userData.last_name}` },
        {
          where: {
            user_id: user_id,
            phone_number: userData.phone_number,
          },
        }
      );
    } else {
      await AllContact.create({
        phone_number: userData.phone_number,
        full_name: `${userData.first_name} ${userData.last_name}`,
        user_id: user_id,
      });
    }



    // Parse json to object ===================================================================
    contact_list = JSON.parse(contact_list);

    // Remove Dublicate Numbers ==================================================================================
    let uniqueNumbers = new Set();
    let uniqueArray = [];

    for (let item of contact_list) {
      if (!uniqueNumbers.has(item.number)) {
        uniqueNumbers.add(item.number);
        uniqueArray.push(item);
      }
    }

    let newContactList = [];

    // Check in the database which phone numbers are present ======================================================
    await Promise.all(
      uniqueArray.map(async (e) => {

        if (e.number == userData.phone_number) {
          console.log('\x1b[32m', e,'e++++++++++++++-------------------------------------', '\x1b[0m');
        }
        const isUserExist = await User.findOne({
          where: {
            phone_number: e.number,
          },
          attributes: {
            exclude: ["otp"],
          },
        });

        let full_name = e.name;

        const contactDetail = await AllContact.findOne({
          where: {
            user_id: user_id,
            phone_number: e.number,
          },
        });

        if (contactDetail) {
          const updatedContactDetails = await AllContact.update(
            { full_name: full_name },
            {
              where: {
                user_id: user_id,
                phone_number: e.number,
              },
            }
          );
        } else {
          if (isUserExist) {
            const AllContactRes = await AllContact.create({
              phone_number: e.number,
              full_name: full_name,
              user_id: user_id,
            });
          }
        }
        if (isUserExist) {
          // Push existing user details to newcontactList
          let contact = isUserExist.toJSON();
          contact.full_name = e.name; // Modify the specific value
          newContactList.push(contact);
        }
      })
    );
    // console.log(newContactList);

    // let end_time = Date.now();
    // let total_time = end_time - start_time;
    // console.log("contect List");
    // console.log("Total time: " + total_time + " milliseconds");
    return res.status(200).json({
      success: true,
      message: "done",
      newContactList,
    });
  } catch (error) {
    // Handle the Sequelize error and send it as a response to the client
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllAvailableContacts };
