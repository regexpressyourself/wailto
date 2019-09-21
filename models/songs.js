/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('songs', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      field: 'id'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'name'
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'image'
    },
    album: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'album'
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'url'
    },
    artist: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'artist'
    },
    artistid: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'artistid'
    },
    genre1: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'genre1'
    },
    genre2: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'genre2'
    },
    genre3: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'genre3'
    },
    genre4: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'genre4'
    }
  }, {
    tableName: 'songs'
  });
};
