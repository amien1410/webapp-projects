module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    phone_number: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    email_id: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    country_full_name: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    device_token: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    one_signal_player_id: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    user_name: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    bio: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "Available",
    },
    dob: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    // login_type: {
    //   type: DataTypes.STRING,
    //   allowNull: true,
    //   defaultValue: "",
    // },
    country_code: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    last_seen: {
      // This Filed is only to update updatedAt time to show Lastseet time.
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    otp: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    profile_image: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
      get() {
        // const raw_urls = this.getDataValue("profile_image").split(",");
        // const imageUrls = raw_urls.map((url) => `${process.env.baseUrl}${url}`);
        // return imageUrls != process.env.baseUrl ? imageUrls : [];
        const raw_urls = this.getDataValue("profile_image");
        const imageUrls = `${process.env.baseUrl}${raw_urls}`;
        return imageUrls != process.env.baseUrl
          ? imageUrls
          : `${process.env.baseUrl}uploads/not-found-images/profile-image.png`;
      },
    },
    Blocked_by_admin: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    viewed_by_admin: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    avatar_id: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: true,
    },
    is_account_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_mobile: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_web: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  });

  User.associate = function (models) {
    User.hasMany(models.Chat, {
      foreignKey: "senderId",
    });
    User.hasMany(models.AllContact, {
      foreignKey: "user_id",
      onDelete: "cascade",
    });

    // Star message ==============================
    User.hasMany(models.StarMessage, {
      foreignKey: "user_id",
    });

    // Star message ==============================
    User.hasMany(models.PinMessage, {
      foreignKey: "user_id",
    });

    // for block user =====================
    User.hasMany(models.Block, {
      foreignKey: "user_id",
    });

    // for block user =====================
    User.hasMany(models.Archive, {
      foreignKey: "user_id",
    });

    // for deleted chatlist =====================
    User.hasMany(models.DeletedChatList, {
      foreignKey: "user_id",
    });

    // for delete Spesific message =====================
    User.hasMany(models.DeleteMessage, {
      foreignKey: "user_id",
    });

    User.hasMany(models.Status, {
      foreignKey: "user_id",
    });

    User.hasMany(models.ReportedUser, {
      foreignKey: "who_report_id",
      as: "Who_Reported",
      onDelete: "CASCADE",
    });

    User.hasMany(models.ReportedUser, {
      foreignKey: "reported_user_id",
      as: "Reported_User",
      onDelete: "CASCADE",
    });

    User.hasMany(models.StatusView, {
      foreignKey: "user_id",
    });
    User.hasMany(models.ClearAllChat, {
      foreignKey: "user_id",
    });
    User.hasMany(models.Call, {
      foreignKey: "user_id",
    });
    User.hasMany(models.PollVote, {
      foreignKey: "user_id",
    });
  };

  return User;
};
