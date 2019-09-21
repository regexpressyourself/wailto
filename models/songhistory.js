/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('songhistory', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    songid: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'songs',
        key: 'id'
      },
      field: 'songid'
    },
    userid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      field: 'userid'
    },
    unixdate: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'unixdate'
    }
  }, {
    tableName: 'songhistory'
  });
};
