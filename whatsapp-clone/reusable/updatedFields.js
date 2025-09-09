function updateFieldIfDefined(updateFields, fieldName, value) {
  if (value !== undefined && value !== "") {
    updateFields[fieldName] = value;
  }
}
module.exports = { updateFieldIfDefined };
