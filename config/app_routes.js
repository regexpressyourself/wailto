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

let saveCoverage = (userId, from, to) => {
  console.log('save coverage');
  return new Promise((resolve, reject) => {
    let values = [];
    console.log('looking for day coverage');
    console.log(from);
    console.log(to);
    while (from < to) {
      let unixFrom = Math.round(from.getTime() / 1000);
      values.push([userId, unixFrom]);
      from.setDate(from.getDate() + 1);
    }
    console.log(values);

    const query = format(
      'INSERT INTO hist_coverage (user_id, day) VALUES %L',
      values,
    );
    console.log(query);
    client
      .query(query)
      .then(res => {
        console.log('coverage res');
        resolve(res);
      })
      .catch(e => {
        console.error(e);
        reject(e);
      });
  });
};

let saveSongs = (userId, history) => {
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
        console.error(e);
        reject(e);
      });
  });
};

let saveHistory = (userId, history) => {
  console.log('save history');
  return new Promise((resolve, reject) => {
    let historyValues = [];
    for (let song of history) {
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
        console.error(e);
        reject(e);
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

const fetchTracks = (username, key, from, to) => {
  console.log('fetch tracks');
  return new Promise((resolve, reject) => {
    let url = `https://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks&user=${username}&api_key=${key}&limit=200&extended=0&page=1&format=json&to=${to}&from=${from}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        console.log('got tracks');
        let recentTracks = data.recenttracks.track.map(track => {
          let id = track.mbid
            ? stringHash(track.mbid)
            : stringHash(track.name + track.artist['#text']);
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
        let coverageValues = [];

        let newFrom = new Date(from.getTime());
        while (newFrom < to) {
          let newUnixFrom = Math.round(newFrom.getTime() / 1000);
          coverageValues.push(newUnixFrom);
          newFrom.setDate(newFrom.getDate() + 1);
        }

        const coverageQuery = format(
          `SELECT * FROM hist_coverage WHERE day IN (%L) AND user_id = ${userId};`,
          coverageValues,
        );
        client.query(coverageQuery).then(coverageRes => {
          let fetchArray = [];

          console.log(coverageRes);
          console.log(coverageQuery);
          console.log('coverage coverageRes');
          let storedCoverageValues = coverageRes.rows;
          console.log(storedCoverageValues.length);
          console.log(coverageValues.length);
          if (storedCoverageValues.length >= coverageValues.length) {
            // all stored, serialize from db
            console.log('starting db  serialization');
            console.log('getting songs in date range');
            const songDataQuery = `SELECT * FROM song_history WHERE unix_date >= ${unixFrom} AND  unix_date <= ${unixTo} AND user_id = ${userId};`;
            client
              .query(songDataQuery)
              .then(songDataRes => {
                let songInfoValues = [];
                for (let song of songDataRes.rows) {
                  songInfoValues.push(song.song_id);
                }

                console.log("getting songs' info");
                const songInfoQuery = format(
                  `SELECT * FROM songs WHERE id IN (%L)`,
                  songInfoValues,
                );
                client
                  .query(songInfoQuery)
                  .then(songInfoRes => {
                    console.log(songInfoRes);
                    // TODO serialize this
                  })
                  .catch(e => {
                    console.error(e);
                  });
              })
              .catch(e => {
                console.error(e);
              });
          } else {
            console.log('need to fetch some tracks');
            // some missing data, fetch certain days
            let missingDays = coverageValues.filter(val => {
              return storedCoverageValues.includes(val);
            });
            //console.log(missingDays);
            // TODO optimize this for large gaps
            fetchTracks(
              username,
              LASTFM_KEY,
              missingDays[0],
              missingDays[missingDays.length - 1],
            )
              .then(recentTracks => {
                console.log('done fetching tracks. saving now');
                saveSongs(userId, recentTracks);
                saveHistory(userId, recentTracks);
                saveCoverage(userId, from, to);
              })
              .catch(e => {
                console.error(e);
              });
          }
        });
      })
      .catch(e => {
        console.error(e);
      });
  });
};
/*
    Promise.all([
      getUser(username),
      fetchTracks(username, LASTFM_KEY, unixFrom, unixTo),
    ])
      .then(dbResponse => {
        let userId = dbResponse[0].id;
        let recentTracks = dbResponse[1];

        Promise.all([
          saveSongs(userId, recentTracks),
          saveHistory(userId, recentTracks),
          saveCoverage(userId, from, to),
        ]).catch(e => {
          console.error(e);
        });
      })
      .catch(e => {
        console.error(e);
      });
      */
