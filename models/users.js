/* jshint indent: 2 */

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "users",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: "id",
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "username",
      },
    },
    {
      tableName: "users",
    },
  );
};
