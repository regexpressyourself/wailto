const path = require('path');
const express = require('express');
const request = require('request');
const cors = require('cors');

const {
  getUser,
  getSongHistory,
  getCoverageValues,
  saveUserInfo,
} = require('./database');

const {fetchAndSaveTracks, removeDuplicates} = require('./api');

const {getDateRange, resetDate} = require('./dates');

module.exports = app => {
  app.get('/history', cors(), async (req, res, next) => {
    let request = JSON.parse(JSON.stringify(req.query));
    let username = request.username;
    const from = resetDate(request.from).jsTime;
    const unixFrom = resetDate(request.from).unixTime;
    const to = resetDate(request.to, true).jsTime;
    const unixTo = resetDate(request.to, true).unixTime;

    let userRes;
    try {
      userRes = await getUser(username);
    } catch (error) {
      console.error('ERROR: ', error.stack);
      res.status(502).send('Error getting user');
      return false;
    }
    let userid = userRes.id;

    // check if user has already stored the requested data
    let storedCoverageValues;
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
      let recentTracks;
      try {
        recentTracks = await fetchAndSaveTracks(
          username,
          missingValues,
          storedCoverageValues,
        );
      } catch (error) {
        console.error('ERROR: ', error.stack);
        res.status(502).send('Error fetching and saving tracks');
        return false;
      }
      let saveUserResponses;
      try {
        saveUserResponses = await saveUserInfo(userid, from, to, recentTracks);
      } catch (error) {
        console.error('ERROR: ', error.stack);
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
