module.exports = (sequelize, DataTypes) => {
    const App_Flow = sequelize.define("App_Flow", {
        setting_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        isContact: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },

    });

    return App_Flow;
};