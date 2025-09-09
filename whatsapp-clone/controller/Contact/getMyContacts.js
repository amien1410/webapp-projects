const { User, AllContact, App_Flow } = require("../../models");
const { Op } = require("sequelize");

// const getMyContacts = async (req, res) => {
//   const user_id = req.authData.user_id;
//   let { page = 1, per_page_message = 100, full_name } = req.body;

//   try {
//     page = parseInt(page); // Default to page 1 if not provided
//     const limit = parseInt(per_page_message);
//     const offset = (page - 1) * limit; // Calculate offset for pagination

//     const App_FlowData = await App_Flow.findOne({
//       attributes: ["isContact"],
//     });

//     let updatedFields = {};
//     if (App_FlowData.isContact === "0") {
//       const currentUserData = await User.findOne({
//         where: { user_id },
//         attributes: ["phone_number"],
//       });
//       console.log(currentUserData.phone_number, "currentUserData.phone_number");

//       updatedFields = {
//         [Op.or]: [
//           { user_id: user_id },
//           { phone_number: currentUserData.phone_number },
//         ],
//       };
//     }
//     // Add user_name condition outside the App_FlowData condition
//     if (full_name && full_name !== "") {
//       updatedFields.full_name = { [Op.like]: `%${full_name}%` };
//     }
//     const AllContactCount = await AllContact.count();

//     const myContactList = await AllContact.findAll({
//       where: updatedFields,
//       attributes: ["contact_id", "phone_number", "full_name"],
//       group: ["phone_number"],
//       limit,
//       offset,
//     });

//     // Fetch user details for each contact using Promise.all
//     const updatedContactList = await Promise.all(
//       myContactList.map(async (contact) => {
//         const userDetails = await User.findOne({
//           where: { phone_number: contact.phone_number }, //
//           attributes: ["profile_image", "user_id", "user_name"],
//         });

//         // Append the user details to the contact
//         return {
//           ...contact.toJSON(),
//           userDetails,
//         };
//       })
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Contact list of who use our app",
//       myContactList: updatedContactList,
//       pagination: {
//         count: AllContactCount, // Total count
//         currentPage: page,
//         totalPages: Math.ceil(AllContactCount / limit),
//       },
//     });
//   } catch (error) {
//     // Handle the Sequelize error and send it as a response to the client
//     console.error(error);
//     res.status(500).json({ error: error.message });
//   }
// };

const getMyContacts = async (req, res) => {
  const user_id = req.authData.user_id;
  let { page = 1, per_page_message = 100, full_name } = req.body;

  try {
    page = parseInt(page);
    const limit = parseInt(per_page_message);
    const offset = (page - 1) * limit;

    const App_FlowData = await App_Flow.findOne({
      attributes: ["isContact"],
    });

    let updatedFields = {};

    if (App_FlowData.isContact === "0") {
      const currentUserData = await User.findOne({
        where: { user_id },
        attributes: ["phone_number"],
      });

      updatedFields = {
        [Op.or]: [
          { user_id: user_id },
          { phone_number: currentUserData.phone_number },
        ],
      };
    } else {
      // const currentUserData = await User.findOne({
      //   where: { user_id },
      //   attributes: ["phone_number"],
      // });
      // updatedFields = {
      //   [Op.or]: [
      //     { user_id: user_id },
      //     { phone_number: currentUserData.phone_number },
      //   ],
      // };
    }

    if (full_name && full_name !== "") {
      updatedFields.full_name = { [Op.like]: `%${full_name}%` };
    }

    // Fetch saved contacts (prioritized)
    const savedContacts = await AllContact.findAll({
      where: updatedFields,
      attributes: ["contact_id", "phone_number", "full_name", "user_id"],
      group: ["phone_number"],
      limit,
      offset,
    });
    // Fetch all contacts (fallback for non-saved matches)
    const allContacts = await AllContact.findAll({
      where: updatedFields.full_name ? updatedFields : {},
      attributes: ["contact_id", "phone_number", "full_name", "user_id"],
      group: ["phone_number"],
      limit,
      offset,
    });

    // return res.json({ savedContacts: savedContacts, allContacts: allContacts });
    // Deduplicate and prioritize savedContacts
    const uniqueContactsMap = new Map();

    // Add savedContacts first (they take priority)
    savedContacts.forEach((contact) => {
      uniqueContactsMap.set(contact.phone_number, contact);
    });

    // Add allContacts, but only if the phone_number is not already present
    allContacts.forEach((contact) => {
      if (!uniqueContactsMap.has(contact.phone_number)) {
        uniqueContactsMap.set(contact.phone_number, contact);
      }
    });

    const uniqueContacts = Array.from(uniqueContactsMap.values());

    // Fetch user details for each unique contact
    const updatedContactList = await Promise.all(
      uniqueContacts.map(async (contact) => {
        const userDetails = await User.findOne({
          where: { phone_number: contact.phone_number },
          attributes: ["profile_image", "user_id", "user_name", "email_id"],
        });

        return {
          ...contact.toJSON(),
          userDetails,
        };
      })
    );

    const AllContactCount = await AllContact.count({ where: updatedFields });

    return res.status(200).json({
      success: true,
      message: "Contact list of who use our app",
      myContactList: updatedContactList,
      pagination: {
        count: AllContactCount,
        currentPage: page,
        totalPages: Math.ceil(AllContactCount / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getMyContacts };
