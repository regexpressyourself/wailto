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
  console.log('save coverage');
  return new Promise((resolve, reject) => {
    console.log('looking for day coverage');

    let values = getDateRange(from, to);
    values = values.map(value => {
      return [userId, value];
    });

    const query = format(
      'INSERT INTO hist_coverage (user_id, day) VALUES %L',
      values,
    );
    client
      .query(query)
      .then(res => {
        console.log('coverage res');
        resolve(res);
      })
      .catch(e => {
        console.log('error saving coverage!');
        console.error(e);
        reject(e);
      });
  });
};

const saveSongs = (userId, history) => {
  console.log('save songs');
  return new Promise((resolve, reject) => {
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
    client
      .query(songQuery)
      .then(songRes => {
        console.log('songRes');
        resolve(songValues);
      })
      .catch(e => {
        console.log('error saving songs!');
        console.error(e);
        reject(e);
      });
  });
};

const saveHistory = (userId, history) => {
  console.log('save history');
  return new Promise((resolve, reject) => {
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
    client
      .query(historyQuery)
      .then(historyRes => {
        console.log('historyRes');
        resolve(historyValues);
      })
      .catch(e => {
        console.log('error saving history!');
        console.error(e);
        reject(e);
      });
  });
};

const fetchTracks = (username, key, from, to) => {
  console.log('fetch tracks');
  return new Promise((resolve, reject) => {
    let url = `https://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks&user=${username}&api_key=${key}&limit=200&extended=0&page=1&format=json&to=${to}&from=${from}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        let trackList = [];
        console.log('got tracks');
        //if (typeof data.recenttracks.track === 'object') {
        //trackList.push(data.recenttracks.track);
        //}
        //else if (data.recenttracks.track.length > 1) {
        trackList = data.recenttracks.track;
        //}
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
            image: track.image
              ? track.image[track.image.length - 1]['#text']
              : '',
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
          fetchTracks(username, key, lastDate, to)
            .then(newTracks => {
              recentTracks.concat(newTracks);
              resolve(recentTracks);
            })
            .catch(e => {
              console.error(e);
              reject(e);
            });
        } else {
          resolve(recentTracks);
        }
      })
      .catch(err => {
        console.error(err);
        reject(err);
      });
  });
};

const getUser = username => {
  console.log('get user');
  return new Promise((resolve, reject) => {
    let query = `SELECT * FROM users WHERE username = '${username}';`;
    client
      .query(query)
      .then(res => {
        if (res.rows.length > 0) {
          console.log('got stored user ');
          resolve(res.rows[0]);
        } else if (res.rows.length === 0) {
          console.log('user not found -- creating user');
          let insertUserQuery = `INSERT INTO users (username) VALUES ( '${username}' ) RETURNING id;`;
          client
            .query(insertUserQuery)
            .then(confirmRes => {
              console.log('user created');
              resolve(confirmRes.rows[0]);
            })
            .catch(e => {
              console.error(e.stack);
              reject(e);
            });
        }
      })
      .catch(e => {
        console.error(e.stack);
        reject(e);
      });
  });
};

const getSongHistoryFromDb = (userId, unixFrom, unixTo) => {
  const listeningHistoryQuery = `SELECT * FROM song_history WHERE unix_date >= ${unixFrom} AND  unix_date <= ${unixTo} AND user_id = ${userId};`;

  console.log('getting song history');
  return new Promise((resolve, reject) => {
    client
      .query(listeningHistoryQuery)
      .then(listeningHistoryRes => {
        console.log('got song history');

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
          resolve([]);
          return;
        }

        console.log("getting songs' info");
        const songInfoQuery = format(
          `SELECT * FROM songs WHERE id IN (%L)`,
          listeningHistoryIds,
        );
        client
          .query(songInfoQuery)
          .then(songInfoRes => {
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
            resolve(finalArray);
          })
          .catch(e => {
            console.error(e);
            reject("getting songs' info failed", e);
          });
      })
      .catch(e => {
        console.error(e);
        reject('getting song history failed', e);
      });
  });
};

let saveUserInfo = (username, userId, from, to) => {
  let unixFrom = Math.round(from.getTime() / 1000);
  let unixTo = Math.round(to.getTime() / 1000);

  return new Promise((resolve, reject) => {
    fetchTracks(username, LASTFM_KEY, unixFrom, unixTo)
      .then(recentTracks => {
        console.log('done fetching tracks. saving now');
        console.log(userId);
        console.log(from);
        console.log(to);
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
      })
      .catch(e => {
        console.error('error waiting on LastFM fetch');
        console.error(e);
        reject(e);
      });
  });
};

const getCoverageValues = (userId, from, to) => {
  return new Promise((resolve, reject) => {
    let unixFrom = Math.round(from.getTime() / 1000);
    let unixTo = Math.round(to.getTime() / 1000);
    console.log(
      format(
        `SELECT * FROM hist_coverage WHERE day IN (%L) AND user_id = ${userId};`,
        getDateRange(from, to),
      ),
    );
    console.log(getDateRange(from, to));
    console.log(from);
    console.log(to);
    const coverageQuery = format(
      `SELECT * FROM hist_coverage WHERE day IN (%L) AND user_id = ${userId};`,
      getDateRange(from, to),
    );
    client
      .query(coverageQuery)
      .then(coverageRes => {
        let storedCoverageValues = coverageRes.rows;
        console.log('storedCoverageValues', storedCoverageValues);
        resolve(storedCoverageValues);
      })
      .catch(e => {
        console.error('error getting user coverage');
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

    getUser(username)
      .then(userRes => {
        console.log('userRes');
        let userId = userRes.id;
        getCoverageValues(userId, from, to)
          .then(storedCoverageValues => {
            if (storedCoverageValues.length >= getDateRange(from, to).length) {
              // all stored, serialize from db
              console.log('starting db  serialization');
              console.log('getting songs in date range');
              getSongHistoryFromDb(userId, unixFrom, unixTo)
                .then(finalResult => {
                  console.log('sending songs from db');
                  res.json(finalResult);
                })
                .catch(e => {
                  console.error(e);
                });
            } else {
              console.log('need to fetch some tracks');
              // some missing data, fetch certain days
              //let missingDays = coverageValues.filter(val => {
              //return storedCoverageValues.includes(val);
              //});
              //console.log(missingDays);
              // TODO optimize this for large gaps
              //fetchTracks(
              //username,
              //LASTFM_KEY,
              //missingDays[0],
              //missingDays[missingDays.length - 1],
              //)
              //
              //
              saveUserInfo(username, userId, from, to)
                .then(dbResponse => {
                  console.log('getting freshly fetched songs from db');

                  getSongHistoryFromDb(userId, unixFrom, unixTo)
                    .then(finalResult => {
                      console.log('sending freshly fetched songs from db');
                      res.json(finalResult);
                    })
                    .catch(e => {
                      console.error(e);
                    });
                })
                .catch(e => {
                  console.log('error saving user info');
                  console.error(e);
                });
            }
          })
          .catch(e => {
            console.error(e);
          });
      })
      .catch(e => {
        console.error(e);
      });
  });
};
