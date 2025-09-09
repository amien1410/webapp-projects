module.exports = (sequelize, DataTypes) => {
  const Status = sequelize.define("Status", {
    status_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    // After changes in flow status text will be different for every media so i added it in statusMedia
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  Status.associate = function (models) {
    Status.belongsTo(models.User, {
      foreignKey: "user_id",
    });
    Status.hasMany(models.StatusMedia, {
      foreignKey: "status_id",
      onDelete: "CASCADE",
    });
    Status.hasMany(models.StatusView, {
      foreignKey: "status_id",
      onDelete: "CASCADE",
    });
  };

  return Status;
};
