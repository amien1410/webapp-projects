function checkRequiredFields(fields, res) {
  for (const field of fields) {
    if (field.value == undefined || field.value == "") {
      return res
        .status(400)
        .json({ message: `${field.name} field is required.`, success: false });
    }
  }
  return null;
}
module.exports = checkRequiredFields;
