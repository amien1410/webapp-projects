function isLink(text) {
  // Regular expression to match common link patterns
  const linkRegex = /^(http[s]?:\/\/|www\.)\S+/i;

  // Use the test method to check if the text matches the link pattern
  return linkRegex.test(text);
}
module.exports = isLink;
