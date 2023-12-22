const axios = require("axios");
const stringHash = require("string-hash");
const { resetDate } = require("./dates");
const { GENRELIST } = require("./constants");
require("dotenv").config();
const LASTFM_KEY = process.env.LASTFM_KEY;

const removeDuplicates = (array) => {
  const reducedArray = array.reduce((acc, current) => {
    const x = acc.find((item) => item.id === current.id);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);
  return reducedArray;
};

const fetchArtistInfo = async function (artistInfoHash) {
  console.log("fetching tags");

  let artistInfoRequests = [];
  for (let artist in artistInfoHash) {
    console.log("getting artist: " + artist);
    artistInfoRequests.push(
      axios.get("https://ws.audioscrobbler.com/2.0/", {
        params: {
          method: "artist.gettoptags",
          artist: artist,
          mbid: artistInfoHash[artist].id,
          api_key: LASTFM_KEY,
          format: "json",
        },
      }),
    );
  }

  artistInfoHash = await Promise.all(artistInfoRequests)
    .then(async (allArtistInfo) => {
      console.log("batched artist info requests succeeded:");
      console.log("getting top tags");
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
          let artistName = artistInfoResponse.toptags["@attr"].artist;
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
          artistInfoHash[artistName]
            ? (artistInfoHash[artistName].genres = topTags)
            : null;
        }
      }

      console.log("got artists");
      return artistInfoHash;
    })
    .catch((e) => {
      console.error("error waiting on batched artist info request ");
      console.error(e);
      reject(e);
    });
  return artistInfoHash;
};

const fetchTracks = async function (username, key, from, to, page = 1) {
  console.log("page %i: fetching tracks", page);

  let lastFMData;
  try {
    lastFMData = await axios.get("https://ws.audioscrobbler.com/2.0/", {
      params: {
        method: "user.getRecentTracks",
        user: username,
        api_key: key,
        limit: 200,
        extended: 0,
        page: 1,
        format: "json",
        to: to,
        from: from,
        page: page,
      },
    });
    lastFMData = lastFMData.data;
  } catch (error) {
    console.error("ERROR: ", error);
    throw new Error(error);
  }

  console.log("page %i: got tracks", page);

  if (!lastFMData.recenttracks) {
    console.error("ERROR: no recent tracks");
    return false;
  }
  let recentTracks = lastFMData.recenttracks.track.map((track) => {
    return serializeLastFmData(track, username);
  });
  let totalPages = lastFMData.recenttracks["@attr"].totalPages;

  let subsequentRequests = [];
  if (page === 1 && page < totalPages) {
    console.log("HIT LIMIT -- getting more tracks ");
    while (page < totalPages) {
      page = page + 1;
      console.log(
        `getting page ${page} of ${lastFMData.recenttracks["@attr"].totalPages}`,
      );
      try {
        subsequentRequests.push(fetchTracks(username, key, from, to, page));
      } catch (error) {
        console.error("ERROR: ", error);
        throw new Error(error);
        return false;
      }
    }
  }

  if (subsequentRequests.length) {
    recentTracks = await Promise.all(subsequentRequests)
      .then((allTrackLists) => {
        // allTrackLists is an array containing the "page"s of tracks from LastFM
        console.log("batched track requests succeeded:");
        for (let trackList of allTrackLists) {
          console.log(`\tbatch length: ${trackList.length}`);
          recentTracks = recentTracks.concat(trackList);
          recentTracks = removeDuplicates(recentTracks);
        }
        console.log("recentTracks.length");
        console.log(recentTracks.length);
        return recentTracks;
      })
      .catch((e) => {
        console.error("ERROR: ", "error waiting on batched track request ");
        console.error("ERROR: ", e);
        reject(e);
      });
  }
  console.log("Full track list length:");
  console.log(recentTracks.length);
  return recentTracks;
};

const serializeLastFmData = (track, username) => {
  let id;
  if (track.mbid) {
    id = stringHash(track.mbid + username + (track.date ? track.date.uts : ""));
  } else if (track.artist) {
    id = stringHash(track.name + track.artist["#text"]);
  } else {
    id = stringHash(track.name);
  }
  let newTrack = {
    name: track.name,
    id: id,
    url: track.url,
    date: track.date ? track.date.uts : "",
    album: track.album ? track.album["#text"] : "",
    image: track.image ? track.image[track.image.length - 1]["#text"] : "",
    artist: track.artist ? track.artist["#text"] : "",
    artistid: track.artist ? track.artist["mbid"] : "",
  };

  return newTrack;
};

const attachArtistInfo = async (recentTracks) => {
  let artistInfoHash = {};
  for (let track of recentTracks) {
    artistInfoHash[track.artist] = { id: track.artistid };
  }

  artistInfoHash = await fetchArtistInfo(artistInfoHash);

  recentTracks = recentTracks.map((track) => {
    let genres = artistInfoHash[track.artist].genres;
    if (!genres) {
      return track;
    }
    track.genre1 = genres[0] ? genres[0] : "";
    track.genre2 = genres[1] ? genres[1] : "";
    track.genre3 = genres[2] ? genres[2] : "";
    track.genre4 = genres[3] ? genres[3] : "";
    return track;
  });

  return recentTracks;
};

const fetchAndSaveTracks = async (
  username,
  missingValues,
  storedCoverageValues,
) => {
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
  let missingTo = resetDate(
    missingValues[missingValues.length - 1],
    true,
  ).unixTime;

  let recentTracks;

  try {
    recentTracks = await fetchTracks(
      username,
      LASTFM_KEY,
      missingFrom,
      missingTo,
    );
  } catch (error) {
    console.error("ERROR: ", error.stack);
    return false;
  }

  try {
    recentTracks = await attachArtistInfo(recentTracks);
  } catch (error) {
    console.error("ERROR: ", error.stack);
    return false;
  }

  return recentTracks;
};

exports.fetchArtistInfo = fetchArtistInfo;
exports.fetchTracks = fetchTracks;
exports.serializeLastFmData = serializeLastFmData;
exports.attachArtistInfo = attachArtistInfo;
exports.fetchAndSaveTracks = fetchAndSaveTracks;
exports.removeDuplicates = removeDuplicates;
