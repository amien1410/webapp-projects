const { User, AllContact } = require("../models");

async function addOrUpdateContactInAllcontacts({
  first_name,
  last_name,
  user_id,
}) {
  // Fetch user data
  const userData = await User.findOne({ where: { user_id } });
  if (!userData) return;

  const { phone_number, email_id } = userData.dataValues;
  const full_name = `${first_name} ${last_name}`;

  // Check if the contact exists by phone_number
  let contactByPhone = phone_number
    ? await AllContact.findOne({ where: { user_id, phone_number } })
    : null;

  // Check if the contact exists by email_id
  let contactByEmail = email_id
    ? await AllContact.findOne({ where: { user_id, email_id } })
    : null;

  // Update or create for phone_number
  if (contactByPhone) {
    await AllContact.update(
      { full_name },
      { where: { user_id, phone_number } }
    );
  } else if (phone_number) {
    await AllContact.create({ user_id, phone_number, full_name });
  }

  // Update or create for email_id
  if (contactByEmail) {
    await AllContact.update({ full_name }, { where: { user_id, email_id } });
  } else if (email_id) {
    await AllContact.create({ user_id, email_id, full_name });
  }
}

module.exports = addOrUpdateContactInAllcontacts;
