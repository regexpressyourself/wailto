/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('histcoverage', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    day: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'day'
    },
    userid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      field: 'userid'
    }
  }, {
    tableName: 'histcoverage'
  });
};
