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

const removeDuplicates = array => {
  const reducedArray = array.reduce((acc, current) => {
    const x = acc.find(item => item.id === current.id);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);
  return reducedArray;
};

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

const fetchTracks = async function(username, key, from, to, page = 1) {
  console.log('page %i: fetching tracks', page);
  let url = `https://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks&user=${username}&api_key=${key}&limit=200&extended=0&page=1&format=json&to=${to}&from=${from}&page=${page}`;

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
  console.log('page %i: got tracks', page);

  let trackList = [];
  trackList = lastFMData.recenttracks.track;

  let recentTracks = trackList.map(serializeLastFmData);

  let subsequentRequests = [];
  let totalPages = lastFMData.recenttracks['@attr'].totalPages;
  if (page === 1 && page < totalPages) {
    console.log('HIT LIMIT -- getting more tracks ');
    while (page < totalPages) {
      page = page + 1;
      console.log(
        `getting page ${page} of ${lastFMData.recenttracks['@attr'].totalPages}`,
      );
      try {
        subsequentRequests.push(fetchTracks(username, key, from, to, page));
      } catch (error) {
        console.error(error);
      }
    }
  }
  if (subsequentRequests.length) {
    let fullTrackList = await Promise.all(subsequentRequests)
      .then(allTrackLists => {
        // allTrackLists is an array of trackLists
        console.log('batched track requests succeeded:');
        process.stdout.write(`${'['}`);
        for (let trackList of allTrackLists) {
          process.stdout.write(`[${trackList.length}], `);
          recentTracks = recentTracks.concat(trackList);
          recentTracks = removeDuplicates(recentTracks);
        }
        console.log(']');
        console.log('recentTracks.length');
        console.log(recentTracks.length);
        return recentTracks;
      })
      .catch(e => {
        console.error('error waiting on batched track request ');
        console.error(e);
        reject(e);
      });
    console.log('fullTrackList.length');
    console.log(fullTrackList.length);
    return fullTrackList;
  } else {
    return recentTracks;
  }
};

let saveUserInfo = async function(userId, from, to, recentTracks) {
  return new Promise((resolve, reject) => {
    let saveSongsPromise;
    let saveHistoryPromise;
    let saveCoveragePromise;
    if (userId && recentTracks) {
      saveSongsPromise = saveSongs(userId, recentTracks);
      saveHistoryPromise = saveHistory(userId, recentTracks);
    }
    if (userId && from && to) {
      saveCoveragePromise = saveCoverage(userId, from, to);
    }
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
  if (process.env.ENVIRONMENT !== 'dev') {
    console.log('not dev');
    app.use('/', express.static('../front/build'));
    app.get('/', (req, res, next) => {
      res.sendFile(path.join(__dirname, '../front/build/index.html'));
      return;
    });
    app.use(express.static(path.join(__dirname, '/../front/build')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname + '/../front/build/index.html'));
    });
  } else {
    app.use('/', express.static('front/public'));
    app.use('/images', express.static('static/images'));

    app.get('/', (req, res, next) => {
      res.sendFile(path.join(__dirname, '../front/public/index.html'));
      return;
    });
  }
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
      try {
        storedCoverageValues = await getCoverageValues(userId, from, to);
      } catch (error) {
        console.error(error);
      }

      storedCoverageValues = storedCoverageValues.rows;
      if (storedCoverageValues.length < getDateRange(from, to).length) {
        console.log('need to fetch some tracks');
        // some missing data, fetch certain days
        let recentTracks;
        let missingValues = [];
        for (let date of getDateRange(from, to)) {
          if (!storedCoverageValues.find(covVal => covVal.day === date)) {
            missingValues.push(date);
          }
        }
        try {
          recentTracks = await fetchTracks(
            username,
            LASTFM_KEY,
            missingValues[0],
            resetDate(missingValues[missingValues.length - 1], true)[1],
          );
        } catch (error) {
          console.error(error);
        }
        console.log('%i:\tdone fetching tracks. saving now', userId);
        console.log('Total track number: %i\t', recentTracks.length);

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

      finalResult = removeDuplicates(finalResult);

      res.json(finalResult);
    };
    main();
  });
};
