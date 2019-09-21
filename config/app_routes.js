const path = require('path');
const express = require('express');
const request = require('request');
const fetch = require('node-fetch');
const cors = require('cors');
const stringHash = require('string-hash');
const saveSongs = require('./database').saveSongs;
const saveHistory = require('./database').saveHistory;
const saveCoverage = require('./database').saveCoverage;
const getUser = require('./database').getUser;
const getSongHistory = require('./database').getSongHistory;
const getCoverageValues = require('./database').getCoverageValues;
const getDateRange = require('./dates').getDateRange;
const resetDate = require('./dates').resetDate;
const GENRELIST = require('./GENRELIST').GENRELIST;

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

const serializeLastFmData = (track, username) => {
  let id;
  if (track.mbid) {
    id = stringHash(track.mbid + username + (track.date ? track.date.uts : ''));
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
    artistid: track.artist ? track.artist['mbid'] : '',
  };

  return newTrack;
};

const fetchArtistInfo = async function(artistInfoHash, recentTracks) {
  console.log('fetching tags');

  let artistInfoRequests = [];
  for (let artist in artistInfoHash) {
    console.log('getting artist: ' + artist);
    let url = `
  https://ws.audioscrobbler.com/2.0/?method=artist.gettoptags&artist=${artist}&mbid=${artistInfoHash[artist].id}&api_key=${LASTFM_KEY}&format=json`;
    artistInfoRequests.push(fetch(url));
  }
  recentTracks = await Promise.all(artistInfoRequests)
    .then(async allArtistInfo => {
      console.log('batched artist info requests succeeded:');
      console.log('getting top tags');
      for (let artistInfoResponse of allArtistInfo) {
        artistInfoResponse = await artistInfoResponse.json();
        if (artistInfoResponse.toptags) {
          let artistName = artistInfoResponse.toptags['@attr'].artist;
          let topTags = [];
          let i = 0;
          let artistTags = artistInfoResponse.toptags.tag;
          while (topTags.length < 4 && artistTags[i]) {
            if (GENRELIST.includes(artistTags[i].name.toLowerCase())) {
              topTags.push(artistTags[i].name.toLowerCase());
            }
            i++;
          }
          artistInfoHash[artistName]
            ? (artistInfoHash[artistName].genres = topTags)
            : null;
        }
      }
      console.log('adding genre to track info');

      recentTracks = recentTracks.map(track => {
        if (!artistInfoHash[track.artist].genres) {
          return track;
        }
        track.genre1 = artistInfoHash[track.artist].genres[0]
          ? artistInfoHash[track.artist].genres[0]
          : '';
        track.genre2 = artistInfoHash[track.artist].genres[1]
          ? artistInfoHash[track.artist].genres[1]
          : '';
        track.genre3 = artistInfoHash[track.artist].genres[2]
          ? artistInfoHash[track.artist].genres[2]
          : '';
        track.genre4 = artistInfoHash[track.artist].genres[3]
          ? artistInfoHash[track.artist].genres[3]
          : '';
        return track;
      });

      return recentTracks;
    })
    .catch(e => {
      console.error('error waiting on batched artist info request ');
      console.error(e);
      reject(e);
    });
  return recentTracks;
};
const fetchTracks = async function(username, key, from, to, page = 1) {
  console.log('page %i: fetching tracks', page);

  let url = `https://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks&user=${username}&api_key=${key}&limit=200&extended=0&page=1&format=json&to=${to}&from=${from}&page=${page}`;

  let lastFMData;
  try {
    lastFMData = await fetch(url);
  } catch (error) {
    console.error('ERROR: ', error);
    return false;
  }
  try {
    lastFMData = await lastFMData.json();
  } catch (error) {
    console.error('ERROR: ', error);
    return false;
  }

  console.log('page %i: got tracks', page);

  if (!lastFMData.recenttracks) {
    console.error('ERROR: no recent tracks');
    return false;
  }
  let recentTracks = lastFMData.recenttracks.track.map(track => {
    return serializeLastFmData(track, username);
  });
  let totalPages = lastFMData.recenttracks['@attr'].totalPages;

  let subsequentRequests = [];
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
        console.error('ERROR: ', error);
        return false;
      }
    }
  }

  if (subsequentRequests.length) {
    recentTracks = await Promise.all(subsequentRequests)
      .then(allTrackLists => {
        // allTrackLists is an array of trackLists
        console.log('batched track requests succeeded:');
        for (let trackList of allTrackLists) {
          console.log(`\tbatch length: ${trackList.length}`);
          recentTracks = recentTracks.concat(trackList);
          recentTracks = removeDuplicates(recentTracks);
        }
        console.log('recentTracks.length');
        console.log(recentTracks.length);
        return recentTracks;
      })
      .catch(e => {
        console.error('ERROR: ', 'error waiting on batched track request ');
        console.error('ERROR: ', e);
        reject(e);
      });
  }
  console.log('Full track list length:');
  console.log(recentTracks.length);
  return recentTracks;
};

let saveUserInfo = async function(userid, from, to, recentTracks) {
  return new Promise(async (resolve, reject) => {
    let saveSongsPromise;
    let saveHistoryPromise;
    let saveCoveragePromise;
    if (userid && from && to) {
      saveCoveragePromise = saveCoverage(userid, from, to);
    }
    if (userid && recentTracks) {
      // await b/c we need songs before history for foreign key
      saveSongsPromise = await saveSongs(userid, recentTracks);
      saveHistoryPromise = saveHistory(userid, recentTracks);
    }
    Promise.all([saveHistoryPromise, saveCoveragePromise])
      .then(saveUserResponses => {
        resolve(saveUserResponses);
      })
      .catch(e => {
        console.error('ERROR: ', 'error waiting on promises in save');
        console.error('ERROR: ', e);
        reject(e);
      });
  });
};

module.exports = app => {
  app.get('/history', cors(), (req, res, next) => {
    let request = JSON.parse(JSON.stringify(req.query));
    let username = request.username;

    const [from, unixFrom] = resetDate(request.from);
    const [to, unixTo] = resetDate(request.to, true);

    let userid;
    let storedCoverageValues;

    let main = async function() {
      let userRes;
      try {
        userRes = await getUser(username);
      } catch (error) {
        console.error('ERROR: ', error);
        return false;
      }
      userid = userRes.id;
      try {
        storedCoverageValues = await getCoverageValues(userid, from, to);
      } catch (error) {
        console.error('ERROR: ', error);
        return false;
      }

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
          console.error('ERROR: ', error);
          return false;
        }
        console.log('%i:\tdone fetching tracks.', userid);
        console.log('%i:\tfetching artist info.', userid);

        let artistInfoHash = {};
        for (let track of recentTracks) {
          artistInfoHash[track.artist] = {id: track.artistid};
        }

        recentTracks = await fetchArtistInfo(artistInfoHash, recentTracks);

        let saveUserResponses;
        try {
          saveUserResponses = await saveUserInfo(
            userid,
            from,
            to,
            recentTracks,
          );
        } catch (error) {
          console.error('ERROR: ', error);
          return false;
        }
      }
      // all stored, serialize from db
      console.log('starting db  serialization');
      console.log('getting songs in date range');
      let finalResult;
      try {
        finalResult = await getSongHistory(userid, unixFrom, unixTo);
      } catch (error) {
        console.error('ERROR: ', error);
        return false;
      }

      finalResult = removeDuplicates(finalResult);

      res.json(finalResult);
    };
    main();
  });

  app.use('/', express.static('../front/build'));

  app.get('/', (req, res, next) => {
    res.sendFile(path.join(__dirname, '../front/build/index.html'));
    return;
  });

  app.use(express.static(path.join(__dirname, '/../front/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/../front/build/index.html'));
  });
};
