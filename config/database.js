const {Pool, Client} = require('pg');
const format = require('pg-format');
const getDateRange = require('./dates').getDateRange;
require('dotenv').config();
const DB_USER = process.env.DB_USER;
const DB_PW = process.env.DB_PW;

const pool = new Pool({
  user: DB_USER,
  host: 'localhost',
  database: 'wailto',
  password: DB_PW,
  port: 5432,
});

const client = new Client({
  user: DB_USER,
  host: 'localhost',
  database: 'wailto',
  password: DB_PW,
  port: 5432,
});

const saveSongs = (userId, history) => {
  console.log('user %i:\tsave songs', userId);
  let songValues = [];
  for (let song of history) {
    songValues.push([
      song.id,
      song.name,
      song.image,
      song.album,
      song.artist,
      song.url,
    ]);
  }

  const songQuery = format(
    `INSERT INTO songs (id, name, image, album, artist, url)
    VALUES %L
    ON CONFLICT (id)
    DO NOTHING
    RETURNING id;`,
    songValues,
  );
  return client.query(songQuery);
};

const saveHistory = (userId, history) => {
  console.log('user %i:\tsave history', userId);
  let historyValues = [];
  for (let song of history) {
    if (!song.id || !userId || !song.date) {
      continue;
    }
    historyValues.push({id: song.id, userId: userId, date: song.date});
  }

  const dbHistoryValues = historyValues.map(historyItem => {
    return [historyItem.id, historyItem.userId, historyItem.date];
  });

  const historyQuery = format(
    'INSERT INTO song_history (song_id, user_id, unix_date ) VALUES %L ON CONFLICT DO NOTHING;',
    dbHistoryValues,
  );
  return client.query(historyQuery);
};

const saveCoverage = (userId, from, to) => {
  console.log('user %i:\tsave coverage', userId);
  console.log('user %i:\tlooking for day coverage', userId);
  let values = getDateRange(from, to);
  values = values.map(value => {
    return [userId, value];
  });
  const query = format(
    'INSERT INTO hist_coverage (user_id, day) VALUES %L',
    values,
  );
  return client.query(query);
};

const getCoverageValues = (userId, from, to) => {
  let unixFrom = Math.round(from.getTime() / 1000);
  let unixTo = Math.round(to.getTime() / 1000);
  const coverageQuery = format(
    `SELECT * FROM hist_coverage WHERE day IN (%L) AND user_id = ${userId};`,
    getDateRange(from, to),
  );
  return client.query(coverageQuery);
};

const getUser = async function(username) {
  console.log('get user');
  let query = `SELECT * FROM users WHERE username = '${username}';`;
  let getExistingUserRes;
  try {
    getExistingUserRes = await client.query(query);
  } catch (error) {
    console.error(error);
  }
  if (getExistingUserRes.rows.length > 0) {
    console.log('got stored user ');
    return getExistingUserRes.rows[0];
  } else if (getExistingUserRes.rows.length === 0) {
    console.log('user not found -- creating user');
    let insertUserQuery = `INSERT INTO users (username) VALUES ( '${username}' ) RETURNING id;`;
    let saveConfirmationRes;
    try {
      saveConfirmationRes = await client.query(insertUserQuery);
    } catch (error) {
      console.error(error);
    }
    console.log('user created id: ', saveConfirmationRes.rows[0].id);
    return saveConfirmationRes.rows[0];
  }
};

const getSongHistory = async function(userId, unixFrom, unixTo) {
  const listeningHistoryQuery = `SELECT * FROM song_history
                                 WHERE unix_date >= ${unixFrom} AND
                                 unix_date <= ${unixTo} AND
                                 user_id = ${userId};`;

  console.log('user %i:\tgetting song history', userId);
  let listeningHistoryRes;
  try {
    listeningHistoryRes = await client.query(listeningHistoryQuery);
  } catch (error) {
    console.error(error);
  }
  console.log('user %i:\tgot song history', userId);

  let listeningHistoryList = [];
  let listeningHistoryIds = [];

  for (let song of listeningHistoryRes.rows) {
    listeningHistoryList.push({
      song_id: song.song_id,
      date: song.unix_date,
    });
    listeningHistoryIds.push(song.song_id);
  }
  if (listeningHistoryIds.length === 0) {
    return [];
  }

  console.log("%i:\tgetting songs' info", userId);
  const songInfoQuery = format(
    `SELECT * FROM songs WHERE id IN (%L)`,
    listeningHistoryIds,
  );
  let songInfoRes;
  try {
    songInfoRes = await client.query(songInfoQuery);
  } catch (error) {
    console.error(error);
  }
  let songInfoList = songInfoRes.rows;
  let finalArray = [];
  for (let listen of listeningHistoryList) {
    let date = listen.date;
    let songId = listen.song_id;
    let newSongObj;
    newSongObj = songInfoList.find(song => {
      return song.id === songId;
    });
    newSongObj.date = date;
    finalArray.push(newSongObj);
  }
  console.log('sorting history');
  finalArray.sort((a, b) => (a.date > b.date ? 1 : -1));
  console.log('done sorting history');
  return finalArray;
};

client.connect();

exports.client = client;
exports.saveSongs = saveSongs;
exports.saveHistory = saveHistory;
exports.saveCoverage = saveCoverage;
exports.getUser = getUser;
exports.getSongHistory = getSongHistory;
exports.getCoverageValues = getCoverageValues;
