module.exports = (sequelize, DataTypes) => {
    const Group_Setting = sequelize.define("Group_Setting", {
      setting_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },

      max_members: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      
    });
  
    return Group_Setting;
  };