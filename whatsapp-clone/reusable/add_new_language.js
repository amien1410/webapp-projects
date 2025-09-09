const { sequelize, Language_status, Language_setting } = require("../models");
const Sequelize = require("sequelize");
const path = require("path");
const fs = require("fs");

const addLanguageColumn = async (language) => {
  const queryInterface = sequelize.getQueryInterface();

  try {
    // Check if the column already exists
    const tableDescription = await queryInterface.describeTable(
      "Language_settings"
    );

    if (!tableDescription[language]) {
      // If column does not exist
      // Add the new column
      await queryInterface.addColumn("Language_settings", language, {
        type: Sequelize.STRING,
        allowNull: true, // Set this based on your needs
      });
      console.log(`Column '${language}' added successfully.`);

      // Update the newly added column with values from the 'key' column
      await queryInterface.sequelize.query(`
        UPDATE Language_settings 
        SET ${language} = \`key\`
      `);
      console.log(`Values copied from 'key' column to '${language}' column.`);
    } else {
      // console.log(`Column '${language}' already exists.`);
    }
  } catch (error) {
    console.error("Error adding column:", error);
  }
};

const addDefaultEntries = async () => {
  try {
    // First check English exist in Language_status ==================================================================================

    let isLanguageExist = await Language_status.findOne({
      where: { language: "English" },
    });

    if (!isLanguageExist) {
      await Language_status.create({
        language: "English",
        country: "US",
        language_alignment: "ltr",
        status: 1,
        default_status: 1,
      });
      console.log(
        "\x1b[32m",
        "inside create new language ______________",
        "\x1b[0m"
      );
    }

    const queryInterface = sequelize.getQueryInterface();

    // Check if the column already exists
    const tableDescription = await queryInterface.describeTable(
      "Language_settings"
    );

    if (tableDescription["English"] === undefined) {
      // If column does not exist
      // Add the new column
      await queryInterface.addColumn("Language_settings", "English", {
        type: Sequelize.STRING,
        allowNull: true, // Set this based on your needs
      });
    }
    // Read and parse the JSON file
    const filePath = path.join(__dirname, "..", "default_language.json"); // Update the file path if needed
    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    // Loop through the JSON and insert missing keys
    for (const entry of jsonData) {
      const { key } = entry;

      // Check if the key already exists in the database
      const existingEntry = await Language_setting.findOne({
        where: { key },
      });

      if (!existingEntry) {
        // Insert the new key into the table
        await Language_setting.create({ key, English: key });
      }
    }
  } catch (error) {
    console.error("Error adding default entries:", error);
  }
};

// const renameLanguageColumn = async (oldColumnName, newColumnName) => {
//   const queryInterface = sequelize.getQueryInterface();

//   try {
//     // Get table description
//     const tableDescription = await queryInterface.describeTable('Language_settings');

//     // Check if old column exists
//     if (!tableDescription[oldColumnName]) {
//       console.log(`Column '${oldColumnName}' does not exist.`);
//       return;
//     }

//     // Check if new column already exists
//     if (tableDescription[newColumnName]) {
//       console.log(`Column '${newColumnName}' already exists.`);
//       return;
//     }

//     // Add the new column
//     await queryInterface.addColumn('Language_settings', newColumnName, {
//       type: Sequelize.STRING,
//       allowNull: true,  // Set this based on your needs
//     });
//     console.log(`Column '${newColumnName}' added successfully.`);

//     // Copy data from old column to new column
//     await queryInterface.sequelize.query(`
//       UPDATE Language_settings
//       SET ${newColumnName} = ${oldColumnName}
//     `);
//     console.log(`Values copied from '${oldColumnName}' column to '${newColumnName}' column.`);

//     // Remove the old column
//     await queryInterface.removeColumn('Language_settings', oldColumnName);
//     console.log(`Column '${oldColumnName}' removed successfully.`);

//   } catch (error) {
//     console.error('Error renaming column:', error);
//   }
// };

module.exports = { addLanguageColumn, addDefaultEntries };
