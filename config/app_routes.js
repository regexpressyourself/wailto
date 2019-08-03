const path = require('path');
const express = require('express');
const request = require('request');
const fetch = require('node-fetch');
const cors = require('cors');

require('dotenv').config();
const LASTFM_KEY = process.env.LASTFM_KEY;
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
    let to = request.to;
    let recentTracks = [];

    fetch(
      `https://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks&user=${username}&api_key=${LASTFM_KEY}&limit=200&extended=0&page=1&format=json&to=${to}`,
    )
      .then(response => response.json())
      .then(data => {
        recentTracks = data.recenttracks.track.map(track => {
          let newTrack = {
            name: track.name,
            date: track.date ? track.date.uts : '',
            album: track.album ? track.album['#text'] : '',
            image: track.image ? track.image[track.image.length - 1]['#text'] : '',
            artist: track.artist ? track.artist['#text'] : '',
          };

          return newTrack;
        });

        res.json(recentTracks);
      })
      .catch(err => {
        console.error(err);
      });

    return;
  });
};
