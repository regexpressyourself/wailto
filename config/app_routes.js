const path = require('path');
const express = require('express');
const request = require('request');
const fetch = require('node-fetch');
const cors = require('cors');
const format = require('pg-format');
const stringHash = require('string-hash');
let client = require('./database').client;

require('dotenv').config();
const LASTFM_KEY = process.env.LASTFM_KEY;

const getDateRange = (start, end) => {
  let daysBetween = [];
  let newStart = new Date(start.getTime());
  while (newStart < end) {
    let newUnixFrom = Math.round(newStart.getTime() / 1000);
    daysBetween.push(newUnixFrom);
    newStart.setDate(newStart.getDate() + 1);
  }
  return daysBetween;
};

const saveCoverage = (userId, from, to) => {
  console.log('%i:\tsave coverage', userId);
  console.log('%i:\tlooking for day coverage', userId);
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

const saveSongs = (userId, history) => {
  console.log('%i:\tsave songs', userId);
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
    'INSERT INTO songs (id, name, image, album, artist, url) VALUES %L ON CONFLICT (id) DO NOTHING RETURNING id;',
    songValues,
  );
  return client.query(songQuery);
};

const saveHistory = (userId, history) => {
  console.log('%i:\tsave history', userId);
  let historyValues = [];
  for (let song of history) {
    if (!song.id || !userId || !song.date) {
      continue;
    }
    historyValues.push([song.id, userId, song.date]);
  }

  const historyQuery = format(
    'INSERT INTO song_history (song_id, user_id, unix_date ) VALUES %L ON CONFLICT DO NOTHING;',
    historyValues,
  );
  return client.query(historyQuery);
};

const fetchTracks = async function(username, key, from, to) {
  console.log('fetch tracks');
  let url = `https://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks&user=${username}&api_key=${key}&limit=200&extended=0&page=1&format=json&to=${to}&from=${from}`;

  let lastFMData = await fetch(url);
  lastFMData = await lastFMData.json();
  let trackList = [];
  console.log('got tracks');
  trackList = lastFMData.recenttracks.track;
  let recentTracks = trackList.map(track => {
    let id;
    if (track.mbid) {
      id = stringHash(track.mbid);
    } else if (track.artist) {
      id = stringHash(track.name + track.artist['#text']);
    } else {
      id = stringHash(track.name);
    }
    let newTrack = {
      name: track.name,
      id: id,
      url: track.url,
      date: track.date ? track.date.uts : '',
      album: track.album ? track.album['#text'] : '',
      image: track.image ? track.image[track.image.length - 1]['#text'] : '',
      artist: track.artist ? track.artist['#text'] : '',
    };

    return newTrack;
  });

  if (recentTracks.length >= 200) {
    console.log('getting more tracks');
    let lastDate = null;
    let i = 0;
    while (lastDate === null) {
      if (recentTracks[i].date && recentTracks[i].date > 0) {
        lastDate = recentTracks[i].date;
      }
      i++;
    }
    let newTracks = await fetchTracks(username, key, lastDate, to);
    recentTracks.concat(newTracks);
    return recentTracks;
  } else {
    return recentTracks;
  }
};

const getUser = async function(username) {
  console.log('get user');
  let query = `SELECT * FROM users WHERE username = '${username}';`;
  let getExistingUserRes = await client.query(query);
  if (getExistingUserRes.rows.length > 0) {
    console.log('got stored user ');
    return getExistingUserRes.rows[0];
  } else if (getExistingUserRes.rows.length === 0) {
    console.log('user not found -- creating user');
    let insertUserQuery = `INSERT INTO users (username) VALUES ( '${username}' ) RETURNING id;`;
    let saveConfirmationRes = await client.query(insertUserQuery);
    console.log('user created');
    return saveConfirmationRes.rows[0];
  }
};

const getSongHistoryFromDb = async function(userId, unixFrom, unixTo) {
  const listeningHistoryQuery = `SELECT * FROM song_history WHERE unix_date >= ${unixFrom} AND  unix_date <= ${unixTo} AND user_id = ${userId};`;

  console.log('%i:\tgetting song history', userId);
  let listeningHistoryRes = await client.query(listeningHistoryQuery);
  console.log('%i:\tgot song history', userId);

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
  let songInfoRes = await client.query(songInfoQuery);
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
  return finalArray;
};

let saveUserInfo = async function(userId, from, to, recentTracks) {

  return new Promise((resolve, reject) => {
    let saveSongsPromise = saveSongs(userId, recentTracks);
    let saveHistoryPromise = saveHistory(userId, recentTracks);
    let saveCoveragePromise = saveCoverage(userId, from, to);
    Promise.all([saveSongsPromise, saveHistoryPromise, saveCoveragePromise])
      .then(dbResponse => {
        resolve(dbResponse);
      })
      .catch(e => {
        console.error('error waiting on promises in save');
        console.error(e);
        reject(e);
      });
  });
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

module.exports = app => {
  app.use('/', express.static('front/public'));
  app.use('/images', express.static('static/images'));

  app.get('/', (req, res, next) => {
    res.sendFile(path.join(__dirname, '../front/public/index.html'));
    return;
  });

  app.get('/history', cors(), (req, res, next) => {
    let request = JSON.parse(JSON.stringify(req.query));
    let username = request.username;

    let to = new Date(request.to * 1000);
    to.setHours(0);
    to.setMinutes(0);
    to.setSeconds(0);
    to.setMilliseconds(0);
    let unixTo = Math.round(to.getTime() / 1000);

    let from = new Date(request.from * 1000);
    from.setDate(from.getDate() + 1);
    from.setHours(0);
    from.setMinutes(0);
    from.setSeconds(0);
    from.setMilliseconds(0);
    let unixFrom = Math.round(from.getTime() / 1000);

    let userId;
    let storedCoverageValues;

    let getUserCoverage = async function() {
      let userRes = await getUser(username);
      userId = userRes.id;
      storedCoverageValues = await getCoverageValues(userId, from, to);
      storedCoverageValues = storedCoverageValues.rows;
      console.log(storedCoverageValues);
      if (storedCoverageValues.length < getDateRange(from, to).length) {
        console.log('need to fetch some tracks');
        // some missing data, fetch certain days
        let recentTracks = await fetchTracks(username, LASTFM_KEY, unixFrom, unixTo);
        console.log('%i:\tdone fetching tracks. saving now', userId);
        let saveUserResponses = await saveUserInfo(userId, from, to, recentTracks);
        //saveUserResponses === Promise.all([saveSongsPromise, saveHistoryPromise, saveCoveragePromise])
      }
      // all stored, serialize from db
      console.log('starting db  serialization');
      console.log('getting songs in date range');
      let finalResult = await getSongHistoryFromDb(userId, unixFrom, unixTo);
      res.json(finalResult);
    };
    getUserCoverage();
  });
};
