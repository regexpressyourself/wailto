const isGenre1 = (genre, genre2) => {
  if (genre) {
    if (genre === 'any genre') {
      if (genre2 && genre2 !== 'any genre') {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  } else {
    return false;
  }
};

const isGenre2 = (genre, genre2) => {
  if (genre && genre2 && genre2 !== 'any genre') {
    return true;
  } else {
    return false;
  }
};

const getGenreKey = (genre, genre2) => {
  return isGenre1(genre, genre2) ? genre : 'song count';
};
const getGenre2Key = (genre, genre2) => {
  return isGenre2(genre, genre2) ? genre2 : null;
};

export {isGenre1, isGenre2, getGenreKey, getGenre2Key};
