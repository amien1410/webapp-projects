module.exports = (sequelize, DataTypes) => {
  const Chat = sequelize.define("Chat", {
    message_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    message: {
      type: DataTypes.TEXT,
      defaultValue: "", // Corrected 'default' to 'defaultValue'
    },
    message_type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    who_seen_the_message: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
      // set(value) {
      //   const currentValue = this.getDataValue("who_seen_the_message") || "";
      //   let user_id_list = currentValue ? currentValue.split(",") : [];

      //   console.log("before user list", user_id_list);
      //   console.log(user_id_list.includes(String(value)));

      //   if (!user_id_list.includes(String(value))) {
      //     console.log("user_id_list inside");
      //     user_id_list.push(value);
      //   }

      //   console.log("after user list", user_id_list);
      //   this.setDataValue("who_seen_the_message", user_id_list.join(","));
      // },
    },
    delete_from_everyone: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    delete_for_me: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
      // set(value) {
      //   const currentValue = this.getDataValue("delete_for_me") || "";
      //   let user_id_list = currentValue ? currentValue.split(",") : [];

      //   console.log("before user list", user_id_list);
      //   console.log(user_id_list.includes(String(value)));

      //   if (!user_id_list.includes(String(value))) {
      //     console.log("user_id_list inside");
      //     user_id_list.push(value);
      //   }

      //   console.log("after user list", user_id_list);
      //   this.setDataValue("delete_for_me", user_id_list.join(","));
      // },
    },
    message_read: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
      set(value) {
        // Storing passwords in plaintext in the database is terrible.
        // Hashing the value with an appropriate cryptographic hash function is better.
        this.setDataValue("url", value.replace(process.env.baseUrl, ""));
      },
      get() {
        // const raw_urls = this.getDataValue("url").split(",");
        // const imageUrls = raw_urls.map((url) => `${process.env.baseUrl}${url}`);
        // return imageUrls != process.env.baseUrl ? imageUrls : [];

        // To Provide full url in array 👇🏼
        const raw_urls = this.getDataValue("url");
        const imageUrls = `${process.env.baseUrl}${raw_urls}`;
        return imageUrls != process.env.baseUrl ? imageUrls : "";
      },
    },
    video_time: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    audio_time: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    thumbnail: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
      get() {
        // To Provide full url in array 👇🏼
        // const raw_urls = this.getDataValue("url").split(",");
        // const imageUrls = raw_urls.map((url) => `${process.env.baseUrl}${url}`);
        // return imageUrls != process.env.baseUrl ? imageUrls : [];

        const raw_urls = this.getDataValue("thumbnail");
        const imageUrls = `${process.env.baseUrl}${raw_urls}`;
        return imageUrls != process.env.baseUrl ? imageUrls : "";
      },
    },
    latitude: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    longitude: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    shared_contact_name: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    shared_contact_profile_image: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    shared_contact_number: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    forward_id: {
      // if this is forwared messsage
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    reply_id: {
      // if this is replied messsage
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status_id: {
      // if this is status replied messsage
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  });

  Chat.associate = function (models) {
    Chat.belongsTo(models.User, {
      foreignKey: "senderId",
    });

    // Chat.belongsTo(models.User, {
    //   foreignKey: "receiverId",
    // });

    Chat.belongsTo(models.Conversation, {
      foreignKey: "conversation_id",
      onDelete: "cascade",
    });

    // Star messages ============================
    Chat.hasMany(models.StarMessage, {
      foreignKey: "message_id",
      onDelete: "cascade",
    });
    // PinMessage messages ============================
    Chat.hasMany(models.PinMessage, {
      foreignKey: "message_id",
      onDelete: "cascade",
    });

    // for delete Spesific message =====================
    Chat.hasMany(models.DeleteMessage, {
      foreignKey: "message_id",
      onDelete: "cascade",
    });

    // Celar all chat of the spesific conversation
    Chat.hasMany(models.ClearAllChat, {
      foreignKey: "message_id",
      onDelete: "CASCADE",
    });

    Chat.hasMany(models.PollOption, {
      foreignKey: "message_id",
      onDelete: "CASCADE",
    });
    Chat.hasMany(models.PollVote, {
      foreignKey: "message_id",
      onDelete: "CASCADE",
    });
  };

  return Chat;
};
