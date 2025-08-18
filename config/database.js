const getDateRange = require("./dates").getDateRange;
const stringHash = require("string-hash");
require("dotenv").config();
const DB_USER = process.env.DB_USER;
const DB_PW = process.env.DB_PW;
const DB_NAME = process.env.DB_NAME;
const DB_HOST = process.env.DB_HOST;
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PW, {
  host: DB_HOST,
  dialect: "postgres",
  logging: false,
  define: {
    timestamps: false,
  },
});

const HistCoverageModel = require("../models/histcoverage.js");
const SongHistoryModel = require("../models/songhistory.js");
const SongsModel = require("../models/songs.js");
const UsersModel = require("../models/users.js");

sequelize.sync();

const HistCoverage = HistCoverageModel(sequelize, Sequelize);
const SongHistory = SongHistoryModel(sequelize, Sequelize);
const Songs = SongsModel(sequelize, Sequelize);
const Users = UsersModel(sequelize, Sequelize);

const saveSongs = (userid, history) => {
  console.log("user %i:\tsave songs", userid);
  let songValues = [];
  for (let song of history) {
    songValues.push({
      id: song.id ? song.id : stringHash(song.name),
      name: song.name,
      image: song.image,
      album: song.album,
      artist: song.artist,
      artistid: song.artistid,
      genre1: song.genre1,
      genre2: song.genre2,
      genre3: song.genre3,
      genre4: song.genre4,
      url: song.url,
    });
  }

  return Songs.bulkCreate(songValues, { ignoreDuplicates: true });
};

const saveCoverage = (userid, from, to) => {
  console.log("user %i:\tsave coverage", userid);
  console.log("user %i:\tlooking for day coverage", userid);
  let values = getDateRange(from, to);
  values = values.map((value) => {
    return { userid: userid, day: value };
  });

  return HistCoverage.bulkCreate(values, { ignoreDuplicates: true });
};

const getCoverageValues = (userid, from, to) => {
  let unixFrom = Math.round(from.getTime() / 1000);
  let unixTo = Math.round(to.getTime() / 1000);
  return HistCoverage.findAll({
    where: {
      userid: userid,
      day: {
        [Op.or]: getDateRange(from, to),
      },
    },
  });
};

const getUser = async function (username) {
  console.log("get user");
  let getExistingUserRes;
  try {
    getExistingUserRes = await Users.findAll({
      where: {
        username: username,
      },
    });
  } catch (error) {
    console.error(error);
  }
  if (getExistingUserRes.length > 0) {
    console.log("got stored user ");
    return getExistingUserRes[0];
  } else if (getExistingUserRes.length === 0) {
    console.log("user not found -- creating user");
    let saveConfirmationRes;
    try {
      saveConfirmationRes = await Users.create({ username: username });
    } catch (error) {
      console.error(error);
    }
    console.log("user created id: ", saveConfirmationRes.dataValues);
    return saveConfirmationRes.dataValues;
  }
};

const saveHistory = (userid, history) => {
  console.log("user %i:\tsave history", userid);
  let historyValues = [];
  for (let song of history) {
    if (!song.id || !userid || !song.date) {
      continue;
    }
    historyValues.push({
      songid: song.id ? song.id : stringHash(song.name),
      userid: userid,
      unixdate: song.date,
    });
  }

  return SongHistory.bulkCreate(historyValues, { ignoreDuplicates: true });
};

const getSongHistory = async function (userid, unixFrom, unixTo) {
  console.log("user %i:\tgetting song history", userid);
  let listeningHistoryRes;
  try {
    listeningHistoryRes = await SongHistory.findAll({
      where: {
        [Op.and]: [
          {
            unixdate: {
              [Op.gte]: unixFrom,
            },
          },
          {
            unixdate: {
              [Op.lte]: unixTo,
            },
          },
          { userid: userid },
        ],
      },
    });
  } catch (error) {
    console.error(error);
  }
  console.log("user %i:\tgot song history", userid);

  let listeningHistoryList = [];
  let listeningHistoryIds = [];

  for (let song of listeningHistoryRes) {
    listeningHistoryList.push({
      songid: song.dataValues.songid,
      date: song.dataValues.unixdate,
    });
    listeningHistoryIds.push(song.songid);
  }
  if (listeningHistoryIds.length === 0) {
    return [];
  }

  console.log("%i:\tgetting songs' info", userid);

  let songInfoRes;
  try {
    songInfoRes = await Songs.findAll({
      where: {
        id: {
          [Op.or]: listeningHistoryIds,
        },
      },
    });
  } catch (error) {
    console.error(error);
  }
  let finalArray = [];
  for (let listen of listeningHistoryList) {
    let date = listen.date;
    let songid = listen.songid;
    let newSongObj;
    newSongObj = songInfoRes.find((song) => {
      return song.dataValues.id === songid;
    }).dataValues;
    newSongObj.date = date;
    finalArray.push(newSongObj);
  }
  console.log("sorting history");
  finalArray.sort((a, b) => (a.date > b.date ? 1 : -1));
  console.log("done sorting history");
  return finalArray;
};

let saveUserInfo = async function (userid, from, to, recentTracks) {
  console.log("saving user info");
  return new Promise(async (resolve, reject) => {
    let saveSongsPromise;
    let saveHistoryPromise;
    let saveCoveragePromise;
    if (userid && recentTracks) {
      // await b/c we need songs before history for foreign key
      console.log("saving songs");
      saveSongs(userid, recentTracks)
        .then((saveSongsPromise) => {
          console.log("saved songs");
          saveHistoryPromise = saveHistory(userid, recentTracks);
          if (userid && from && to) {
            saveCoveragePromise = saveCoverage(userid, from, to);
          }
          Promise.all([saveHistoryPromise, saveCoveragePromise])
            .then((saveUserResponses) => {
              console.log("saved history and coverage");
              resolve(saveUserResponses);
            })
            .catch((e) => {
              console.error("ERROR: ", "error waiting on promises in save");
              console.error("ERROR: ", e);
              reject(e);
            });
        })
        .catch((e) => {
          console.error("ERROR: ", "error waiting on songs in save");
          console.error("ERROR: ", e);
          reject(e);
        });
    } else {
      reject("No userid of recentTracks");
    }
  });
};

exports.saveSongs = saveSongs;
exports.getUser = getUser;
exports.saveHistory = saveHistory;
exports.getSongHistory = getSongHistory;
exports.getCoverageValues = getCoverageValues;
exports.saveCoverage = saveCoverage;
exports.saveUserInfo = saveUserInfo;
