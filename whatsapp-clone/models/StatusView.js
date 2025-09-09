module.exports = (sequelize, DataTypes) => {
  const StatusView = sequelize.define("StatusView", {
    status_view_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    status_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
  });

  StatusView.associate = function (models) {
    StatusView.belongsTo(models.Status, {
      foreignKey: "status_id",
      onDelete: "CASCADE",
    });
    StatusView.belongsTo(models.User, {
      foreignKey: "user_id",
    });
  };

  return StatusView;
};
