const {
  Admin,
  Language_setting,
  Language_status,
  sequelize,
} = require("../../models");
const { addLanguageColumn } = require("../../reusable/add_new_language");
const axios = require("axios");

async function AddKey(req, res) {
  try {
    const { admin_id } = req.authData;
    const { key } = req.body;

    if (await Admin.findOne({ where: { admin_id } })) {
      const isKey = await Language_setting.findOrCreate({
        where: { key },
        defaults: {
          key,
        },
      });
      res
        .status(200)
        .json({ success: "true", message: "Key Updated Successfully", isKey });
    } else {
      res
        .status(200)
        .json({ success: "false", message: "Invalid Credentials" });
    }
  } catch (err) {
    console.error(err);
    res.status(501).json({ error: "Error in adding key" });
  }
}
async function FetchDefaultLanguage(req, res) {
  try {
    const { status_id } = req.body;
    let language = "";

    if (status_id) {
      language = await Language_status.findOne({
        where: {
          status: true,
          status_id,
        },
      });
    } else {
      language = await Language_status.findOne({
        where: { default_status: true },
      });
    }
    if (!language) {
      return res.json(404, {
        success: false,
        message: "Language is not available",
      });
    }

    const query = `SELECT \`key\`, \`${language.language}\` FROM Language_settings`;
    const [results] = await sequelize.query(query);

    // Map through results to rename the column dynamically
    const formattedResults = results.map((row) => {
      return {
        key: row.key,
        Translation: row[language.language],
      };
    });

    res.status(200).json({
      // Static Language alignment

      language_alignment: language.language_alignment,
      success: true,
      message: "Language found",
      language: language.language,
      results: formattedResults,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
}

async function FetchLanguageKeywordsWithTranslation(req, res) {
  try {
    const { page = 1, pageSize = 10, status_id } = req.body;

    // Validate the status_id and get the language
    let isLanguage = await Language_status.findOne({ where: { status_id } });
    if (!isLanguage) {
      return res
        .status(404)
        .json({ success: false, message: "Language not found" });
    }
    // const =isLanguage.language
    // const columnExists = await checkColumnExists('Language_settings', languageColumn);
    // Calculate offset
    const offset = (page - 1) * pageSize;

    // Query to get the paginated results, including SettingId
    const results = await sequelize.query(
      `SELECT \`setting_id\`, \`key\`, \`${isLanguage.language}\` FROM Language_settings LIMIT :limit OFFSET :offset`,
      {
        replacements: { limit: pageSize, offset: offset },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    const language_alignment = isLanguage.language_alignment;
    // Query to get the total count of rows
    const totalResult = await sequelize.query(
      `SELECT COUNT(*) as total FROM Language_settings`,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const total = totalResult[0]?.total || 0;

    // Map through results to rename the column dynamically and include SettingId
    const formattedResults = results.map((row) => ({
      setting_id: row.setting_id,
      key: row.key,
      Translation: row[isLanguage.language],
    }));

    // Send the response
    res.status(200).json({
      success: true,
      message: "Language found",
      language_alignment: language_alignment,
      language: isLanguage.language,
      results: formattedResults,
      pagination: {
        currentPage: page,
        pageSize: pageSize,
        totalItems: parseInt(total, 10),
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
}

async function EditKeyword(req, res) {
  try {
    // Extract parameters from the request body

    const { status_id, setting_id, newValue } = req.body;
    let isLanguage = await Language_status.findOne({ where: { status_id } });

    // Validate the inputs
    if (!isLanguage || !setting_id || !newValue) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Update the record in the database
    const result = await sequelize.query(
      `UPDATE Language_settings SET \`${isLanguage.language}\` = :newValue WHERE \`setting_id\` = :setting_id`,
      {
        replacements: { newValue, setting_id },
        type: sequelize.QueryTypes.UPDATE,
      }
    );

    // Check if the update was successful
    if (result[0] === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Setting ID not found" });
    }

    // Send a successful response
    res
      .status(200)
      .json({ success: true, message: "Keyword updated successfully" });
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
}

const AddLanguageColumn = async (req, res) => {
  const { admin_id } = req.authData;
  const { language, country, language_alignment } = req.body;
  console.log(req.body);
  // Extracting language from the request body
  if (await Admin.findOne({ where: { admin_id } })) {
    if (language) {
      await addLanguageColumn(language); // Add language column dynamically
      await Language_status.create({
        language,
        country,
        language_alignment,
      });
      res
        .status(200)
        .json({ success: true, message: `Language column ${language} added.` });
    } else {
      res
        .status(400)
        .json({ message: "Language field is missing in request." });
    }
  } else {
    res.status(200).json({ success: "false", message: "Invalid Credentials" });
  }
};

async function ListAllLanguages(req, res) {
  try {
    const languages = await Language_status.findAll();

    // Check if any languages were found
    if (languages.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No languages found" });
    }

    // Format the results to include language name and status
    const formattedLanguages = languages.map((language) => ({
      language: language.language,
      status: language.status, // Assuming `status` column exists indicating enabled/disabled
      default_status: language.default_status,
      status_id: language.status_id,
      country: language.country,
      language_alignment: language.language_alignment,
    }));

    // Send the response with the list of languages and their statuses
    res.status(200).json({
      success: true,
      message: "Languages retrieved successfully",
      languages: formattedLanguages,
    });
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
}

async function TranslateLanguage(req, res) {
  try {
    // Extract parameters from the request body
    const { status_id, setting_id, newValue } = req.body;
    let isLanguage = await Language_status.findOne({ where: { status_id } });

    // Log the incoming request body for debugging
    console.log("Raw Request Body:", req.body);

    // Validate the inputs
    if (!isLanguage || !setting_id || !newValue) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Construct the data to send to the FastAPI server
    const requestData = {
      json_data: { [setting_id]: newValue }, // Construct the JSON data for the API
      target_language: isLanguage.language, // Target language from the database
    };

    console.log("Request Data to FastAPI:", requestData);

    // URL of the FastAPI endpoint
    const apiUrl = "http://62.72.36.245:3692/translate/"; // Ensure this matches the FastAPI server URL and port

    // Make a POST request to the FastAPI API
    const response = await axios.post(apiUrl, requestData);

    // Handle the response from the FastAPI API
    const translatedData = response.data;
    console.log("Translated Data:", translatedData);

    // Extract the translated value
    const translatedValue = translatedData.translated_data[setting_id];

    // Update the record in the database with the translated value
    const updateResult = await sequelize.query(
      `UPDATE Language_settings SET \`${isLanguage.language}\` = :translatedValue WHERE \`setting_id\` = :setting_id`,
      {
        replacements: { translatedValue, setting_id },
        type: sequelize.QueryTypes.UPDATE,
      }
    );

    // Check if the update was successful
    if (updateResult[0] === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Setting ID not found" });
    }

    // Send a successful response
    res.status(200).json({
      success: true,
      message: "Keyword updated successfully",
      data: translatedData,
    });
  } catch (error) {
    console.error(
      "Error occurred while translating:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({
      success: false,
      message: "An error occurred while translating",
    });
  }
}

async function TranslateAllKeywords(req, res) {
  try {
    const { status_id } = req.body;

    // Fetch language details from the status_id
    let isLanguage = await Language_status.findOne({ where: { status_id } });

    // Validate the inputs
    if (!isLanguage) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status_id" });
    }

    // Get all the settings data for translation
    const results = await sequelize.query(
      `SELECT setting_id, \`key\` FROM Language_settings`,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Construct json_data for FastAPI based on fetched settings
    const jsonData = results.reduce((acc, row) => {
      acc[row.setting_id] = row.key; // setting_id as key, 'key' value to be translated
      return acc;
    }, {});

    // Construct request data for FastAPI
    const requestData = {
      json_data: jsonData,
      target_language: isLanguage.language,
    };

    console.log("Request Data to FastAPI:", requestData);

    // Make a POST request to the FastAPI API
    const apiUrl = "http://62.72.36.245:3692/translate/";
    const response = await axios.post(apiUrl, requestData);

    // Handle the response from the FastAPI API
    const translatedData = response.data.translated_data;

    // Update the database with the translated values
    for (const setting_id in translatedData) {
      const translatedValue = translatedData[setting_id];

      await sequelize.query(
        `UPDATE Language_settings SET \`${isLanguage.language}\` = :translatedValue WHERE \`setting_id\` = :setting_id`,
        {
          replacements: { translatedValue, setting_id },
          type: sequelize.QueryTypes.UPDATE,
        }
      );
    }

    // Send a successful response
    res.status(200).json({
      success: true,
      message: "All keywords translated and updated successfully",
      translated_data: translatedData,
    });
  } catch (error) {
    console.error(
      "Error occurred while translating:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({
      success: false,
      message: "An error occurred while translating",
    });
  }
}

async function UpdateStatus(req, res) {
  try {
    const { status_id, status, default_status } = req.body;
    console.log(req.body);

    // Prepare the payload based on provided values
    let payload = {};
    if (status !== undefined) {
      payload.status = status;
    }
    if (default_status !== undefined) {
      payload.default_status = default_status;
    }

    // Check if there's any payload to update
    if (Object.keys(payload).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No valid fields to update" });
    }

    // Handle default_status logic
    if (default_status === true) {
      // Set default_status to false for all entries
      await Language_status.update(
        { default_status: false },
        {
          where: {},
        }
      );
    }

    // Update language status
    const [updatedCount] = await Language_status.update(payload, {
      where: { status_id },
    });
    console.log(updatedCount);

    // Check if any rows were updated
    if (updatedCount === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status_id" });
    }

    // Send a successful response
    res.status(200).json({
      success: true,
      message: "Status updated successfully",
    });
  } catch (error) {
    console.error("Error occurred while updating status:", error.message);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating status",
    });
  }
}
async function GetLanguageDataFromStatus_id(req, res) {
  try {
    const { status_id } = req.body;

    if (!status_id) {
      return res
        .status(400)
        .json({ success: false, message: "status_id is required" });
    }

    // Fetch language data based on status_id
    const languageData = await Language_status.findOne({
      where: { status_id },
    });

    // Check if data is found
    if (!languageData) {
      return res
        .status(404)
        .json({ success: false, message: "Language not found" });
    }

    // Send the language data as a response
    res.status(200).json({
      success: true,
      data: languageData,
    });
  } catch (error) {
    console.error(
      "Error occurred while fetching language data:",
      error.message
    );
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching language data",
    });
  }
}
async function EditLanguage(req, res) {
  try {
    const {
      status_id,
      language_name,
      language_country,
      default_status,
      language_alignment,
    } = req.body;

    if (!status_id) {
      return res
        .status(400)
        .json({ success: false, message: "status_id is required" });
    }

    // Prepare the payload based on provided values
    let payload = {};
    if (language_name !== undefined) {
      payload.language = language_name;
    }
    if (language_country !== undefined) {
      payload.country = language_country;
    }
    if (language_alignment !== undefined) {
      payload.language_alignment = language_alignment;
    }
    if (default_status !== undefined) {
      payload.default_status = default_status;
    }

    console.log("Payload:", payload);

    // Check if there's any payload to update
    if (Object.keys(payload).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No valid fields to update" });
    }

    // Fetch current column name from Language_status
    const currentLanguage = await Language_status.findOne({
      attributes: ["language"],
      where: { status_id },
    });

    if (!currentLanguage) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status_id" });
    }

    // If language_name is updated, change column name in LanguageSetting and update Language_status
    if (language_name && currentLanguage.language !== language_name) {
      const queryInterface = sequelize.getQueryInterface();

      // Rename column in Language_settings table using MariaDB-compatible syntax
      await queryInterface.sequelize.query(`
                ALTER TABLE Language_settings
                CHANGE COLUMN \`${currentLanguage.language}\` \`${language_name}\` VARCHAR(255);
            `);
      console.log(
        `Column '${currentLanguage.language}' renamed to '${language_name}' successfully.`
      );

      // Update the column name in the Language_status table
      await Language_status.update(
        { language: language_name },
        { where: { status_id } }
      );
      console.log(`Language name updated in Language_status table.`);
    }

    // Update language details in Language_status
    const [updatedCount] = await Language_status.update(payload, {
      where: { status_id },
    });
    // console.log("aaaaaaaaaa");

    // Check if any rows were updated
    // if (updatedCount === 0) {
    //     console.log("aa");

    //     return res.status(400).json({ success: false, message: 'Failed to update language' });
    // }

    // Send a successful response
    // console.log('aa');

    res.status(200).json({
      success: true,
      message: "Language updated successfully",
    });
  } catch (error) {
    console.error("Error occurred while updating language:", error.message);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating language",
    });
  }
}

async function fetchLanguages() {
  try {
    const all_Languages = await Language_status.findAll();
    const languagelist = all_Languages.map((lang) => {
      return lang.dataValues.language;
    });
    return languagelist;
    // console.log(languagelist);
  } catch (error) {
    console.error("Error fetching languages:", error);
  }
}

module.exports = {
  EditLanguage,
  GetLanguageDataFromStatus_id,
  UpdateStatus,
  TranslateAllKeywords,
  AddKey,
  AddLanguageColumn,
  FetchDefaultLanguage,
  FetchLanguageKeywordsWithTranslation,
  EditKeyword,
  TranslateLanguage,
  ListAllLanguages,
  fetchLanguages,
};
