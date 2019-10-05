const path = require('path');
const axios = require('axios');
const express = require('express');
const request = require('request');
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

const fetchArtistInfo = async function(artistInfoHash) {
  console.log('fetching tags');

  let artistInfoRequests = [];
  for (let artist in artistInfoHash) {
    console.log('getting artist: ' + artist);
    artistInfoRequests.push(
      axios.get('https://ws.audioscrobbler.com/2.0/', {
        params: {
          method: 'artist.gettoptags',
          artist: artist,
          mbid: artistInfoHash[artist].id,
          api_key: LASTFM_KEY,
          format: 'json',
        },
      }),
    );
  }
  artistInfoHash = await Promise.all(artistInfoRequests)
    .then(async allArtistInfo => {
      console.log('batched artist info requests succeeded:');
      console.log('getting top tags');
      for (let artistInfoResponse of allArtistInfo) {
        artistInfoResponse = artistInfoResponse.data;
        if (artistInfoResponse.toptags) {
          /*
           * if any genres were returned, assign to hash:
           *
           * artistInfoHash: {
           *   <artistName>: {
           *     id: <artistId>,
           *     genres: [<genre1>, <genre2>, <genre3>, <genre4>]
           *   }
           * }
           **/

          //get artist name
          let artistName = artistInfoResponse.toptags['@attr'].artist;

          // get top 4 approved genres
          let artistTags = artistInfoResponse.toptags.tag;
          let topTags = [];
          let i = 0;
          while (topTags.length < 4 && artistTags[i]) {
            if (GENRELIST.includes(artistTags[i].name.toLowerCase())) {
              topTags.push(artistTags[i].name.toLowerCase());
            }
            i++;
          }

          // assign to hash
          artistInfoHash[artistName] ? (artistInfoHash[artistName].genres = topTags) : null;
        }
      }
      return artistInfoHash;
    })
    .catch(e => {
      console.error('error waiting on batched artist info request ');
      console.error(e);
      reject(e);
    });
  return artistInfoHash;
};
const fetchTracks = async function(username, key, from, to, page = 1) {
  console.log('page %i: fetching tracks', page);

  let lastFMData;
  try {
    lastFMData = await axios.get('https://ws.audioscrobbler.com/2.0/', {
      params: {
        method: 'user.getRecentTracks',
        user: username,
        api_key: key,
        limit: 200,
        extended: 0,
        page: 1,
        format: 'json',
        to: to,
        from: from,
        page: page,
      },
    });
    lastFMData = lastFMData.data;
  } catch (error) {
    console.error('ERROR: ', error);
    throw new Error(error);
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
      console.log(`getting page ${page} of ${lastFMData.recenttracks['@attr'].totalPages}`);
      try {
        subsequentRequests.push(fetchTracks(username, key, from, to, page));
      } catch (error) {
        console.error('ERROR: ', error);
        throw new Error(error);
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
    if (userid && recentTracks) {
      // await b/c we need songs before history for foreign key
      saveSongs(userid, recentTracks)
        .then(saveSongsPromise => {
          saveHistoryPromise = saveHistory(userid, recentTracks);
          if (userid && from && to) {
            saveCoveragePromise = saveCoverage(userid, from, to);
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
        })
        .catch(e => {
          console.error('ERROR: ', 'error waiting on songs in save');
          console.error('ERROR: ', e);
          reject(e);
        });
    }
  });
};

const attachArtistInfo = async recentTracks => {
  let artistInfoHash = {};
  for (let track of recentTracks) {
    artistInfoHash[track.artist] = {id: track.artistid};
  }

  artistInfoHash = await fetchArtistInfo(artistInfoHash);

  recentTracks = recentTracks.map(track => {
    let genres = artistInfoHash[track.artist].genres;
    if (!genres) {
      return track;
    }
    track.genre1 = genres[0] ? genres[0] : '';
    track.genre2 = genres[1] ? genres[1] : '';
    track.genre3 = genres[2] ? genres[2] : '';
    track.genre4 = genres[3] ? genres[3] : '';
    return track;
  });

  return recentTracks;
};

const fetchNewTrackInfo = async (username, from, to, storedCoverageValues) => {
  let recentTracks;
  try {
    recentTracks = await fetchTracks(username, LASTFM_KEY, from, to);
  } catch (error) {
    console.error('ERROR: ', error);
    throw new Error(error);
    return false;
  }

  return recentTracks;
};

module.exports = app => {
  app.get('/history', cors(), async (req, res, next) => {
    let request = JSON.parse(JSON.stringify(req.query));
    let username = request.username;
    const from = resetDate(request.from).jsTime;
    const unixFrom = resetDate(request.from).unixTime;
    const to = resetDate(request.to, true).jsTime;
    const unixTo = resetDate(request.to, true).unixTime;

    let userid;
    let storedCoverageValues;

    let userRes;

    try {
      userRes = await getUser(username);
    } catch (error) {
      console.error('ERROR: ', error.stack);
      res.status(502).send('Error getting user');
      return false;
    }
    userid = userRes.id;

    // check if user has already stored the requested data
    try {
      storedCoverageValues = await getCoverageValues(userid, from, to);
    } catch (error) {
      console.error('ERROR: ', error.stack);
      res.status(502).send('Error getting saved songs');
      return false;
    }

    // find any missing values from the db
    let missingValues = [];
    for (let date of getDateRange(from, to)) {
      if (!storedCoverageValues.find(covVal => covVal.day === date)) {
        missingValues.push(date);
      }
    }

    // some missing data, fetch certain days
    if (missingValues.length) {
      /*
       * Right now, I just re-request every day starting with the first unknown day through to the
       * last unknown day.
       *
       * This is not smart.
       *
       * I can easily run into use cases where I re-request already-stored data. Unfortunately
       * for my API key, writing a better algorithm sounds annoying and there's
       * more fun stuff to do.
       */

      let missingFrom = missingValues[0];
      let missingTo = resetDate(missingValues[missingValues.length - 1], true).unixTime;

      let recentTracks;

      try {
        recentTracks = await fetchNewTrackInfo(
          username,
          missingFrom,
          missingTo,
          storedCoverageValues,
        );
      } catch (error) {
        console.error('ERROR: ', error.stack);
        res.status(502).send('Error checking for saved track info');
        return false;
      }

      try {
        recentTracks = await attachArtistInfo(recentTracks);
      } catch (error) {
        console.error('ERROR: ', error.stack);
        res.status(502).send('Error getting artist info');
        return false;
      }

      let saveUserResponses;
      try {
        saveUserResponses = await saveUserInfo(userid, from, to, recentTracks);
      } catch (error) {
        console.error('ERROR: ', error.stack);
        res.status(502).send('Error saving new info');
        return false;
      }
    }

    // all stored, serialize from db
    let finalResult;
    try {
      finalResult = await getSongHistory(userid, unixFrom, unixTo);
    } catch (error) {
      console.error('ERROR: ', error.stack);
      res.status(502).send('Error retrieving saved songs');
      return false;
    }

    finalResult = removeDuplicates(finalResult);
    console.log('sending data');
    res.json(finalResult);
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
