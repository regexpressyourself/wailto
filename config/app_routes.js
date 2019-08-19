const path = require('path');
const express = require('express');
const request = require('request');
const fetch = require('node-fetch');
const cors = require('cors');
const format = require('pg-format');
const stringHash = require('string-hash');
const client = require('./database').client;
const saveSongs = require('./database').saveSongs;
const saveHistory = require('./database').saveHistory;
const saveCoverage = require('./database').saveCoverage;
const getUser = require('./database').getUser;
const getSongHistory = require('./database').getSongHistory;
const getCoverageValues = require('./database').getCoverageValues;
const getDateRange = require('./dates').getDateRange;
const resetDate = require('./dates').resetDate;

require('dotenv').config();
const LASTFM_KEY = process.env.LASTFM_KEY;

const serializeLastFmData = track => {
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
};

const fetchTracks = async function(username, key, from, to) {
  console.log('fetch tracks');
  let url = `https://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks&user=${username}&api_key=${key}&limit=200&extended=0&page=1&format=json&to=${to}&from=${from}`;

  let lastFMData;
  try {
    lastFMData = await fetch(url);
  } catch (error) {
    console.error(error);
  }
  try {
    lastFMData = await lastFMData.json();
  } catch (error) {
    console.error(error);
  }
  console.log('got tracks');

  let trackList = [];
  trackList = lastFMData.recenttracks.track;

  let recentTracks = trackList.map(serializeLastFmData);

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
    let newTracks;
    try {
      newTracks = await fetchTracks(username, key, lastDate, to);
    } catch (error) {
      console.error(error);
    }
    recentTracks.concat(newTracks);
  }
  return recentTracks;
};

let saveUserInfo = async function(userId, from, to, recentTracks) {
  return new Promise((resolve, reject) => {
    let saveSongsPromise = saveSongs(userId, recentTracks);
    let saveHistoryPromise = saveHistory(userId, recentTracks);
    let saveCoveragePromise = saveCoverage(userId, from, to);
    Promise.all([saveSongsPromise, saveHistoryPromise, saveCoveragePromise])
      .then(saveUserResponses => {
        resolve(saveUserResponses);
      })
      .catch(e => {
        console.error('error waiting on promises in save');
        console.error(e);
        reject(e);
      });
  });
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

    const [from, unixFrom] = resetDate(request.from);
    const [to, unixTo] = resetDate(request.to, true);

    let userId;
    let storedCoverageValues;

    let main = async function() {
      let userRes;
      try {
        userRes = await getUser(username);
      } catch (error) {
        console.error(error);
      }
      userId = userRes.id;
      console.log(username);
      console.log(userId);
      console.log(from);
      console.log(to);
      try {
        storedCoverageValues = await getCoverageValues(userId, from, to);
      } catch (error) {
        console.error(error);
      }
      console.log('storedCoverageValues.rows');
      console.log(storedCoverageValues.rows);
      console.log('storedCoverageValues.length');
      console.log(storedCoverageValues.length);
      console.log('getDateRange(from, to).length');
      console.log(getDateRange(from, to).length);
      storedCoverageValues = storedCoverageValues.rows;
      if (storedCoverageValues.length < getDateRange(from, to).length) {
        console.log('need to fetch some tracks');
        // some missing data, fetch certain days
        let recentTracks;
        try {
          recentTracks = await fetchTracks(
            username,
            LASTFM_KEY,
            unixFrom,
            unixTo,
          );
        } catch (error) {
          console.error(error);
        }
        console.log('%i:\tdone fetching tracks. saving now', userId);

        //saveUserResponses === Promise.all([saveSongsPromise, saveHistoryPromise, saveCoveragePromise])
        let saveUserResponses;
        try {
          saveUserResponses = await saveUserInfo(
            userId,
            from,
            to,
            recentTracks,
          );
        } catch (error) {
          console.error(error);
        }
      }
      // all stored, serialize from db
      console.log('starting db  serialization');
      console.log('getting songs in date range');
      let finalResult;
      try {
        finalResult = await getSongHistory(userId, unixFrom, unixTo);
      } catch (error) {
        console.error(error);
      }
      res.json(finalResult);
    };
    main();
  });
};
