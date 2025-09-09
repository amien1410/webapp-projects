module.exports = (sequelize, DataTypes) => {
  const Conversation = sequelize.define("Conversation", {
    conversation_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    is_group: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    group_name: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    group_profile_image: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
      get() {
        // const raw_urls = this.getDataValue("profile_image").split(",");
        // const imageUrls = raw_urls.map((url) => `${process.env.baseUrl}${url}`);
        // return imageUrls != process.env.baseUrl ? imageUrls : [];
        const raw_urls = this.getDataValue("group_profile_image");
        const imageUrls = `${process.env.baseUrl}${raw_urls}`;
        return imageUrls != process.env.baseUrl
          ? imageUrls
          : `${process.env.baseUrl}uploads/not-found-images/group-profile-image.png`;
      },
    },
    last_message: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    last_message_id: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    last_message_type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    blocked_by_admin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    created_by_admin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    public_group: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  });

  Conversation.associate = function (models) {
    Conversation.hasMany(models.ConversationsUser, {
      foreignKey: "conversation_id",
    });
    Conversation.hasMany(models.Chat, {
      foreignKey: "conversation_id",
    });
    // Conversation.hasMany(models.ReportedUser, {
    //   foreignKey: "conversation_id",
    //   onDelete: "CASCADE",
    // });
    Conversation.hasMany(models.Block, {
      foreignKey: "conversation_id",
    });
    Conversation.hasMany(models.Archive, {
      foreignKey: "conversation_id",
    });
    Conversation.hasMany(models.DeletedChatList, {
      foreignKey: "conversation_id",
    });
    Conversation.hasMany(models.Call, {
      foreignKey: "conversation_id",
    });
    Conversation.hasMany(models.ClearAllChat, {
      foreignKey: "conversation_id",
    });
    Conversation.hasMany(models.StarMessage, {
      foreignKey: "conversation_id",
    });
    Conversation.hasMany(models.PinMessage, {
      foreignKey: "conversation_id",
    });
  };

  return Conversation;
};
