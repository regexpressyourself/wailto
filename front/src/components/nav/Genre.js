import React, {useContext} from 'react';
import {ConfigContext} from '../../context/ConfigContext';
import {GENRELIST} from '../../GENRELIST';
import Select from 'react-select';

const Genre = () => {
  const {config, configDispatch} = useContext(ConfigContext);

  let genreSelectionOptions = GENRELIST.map(genre => {
    return {
      value: genre,
      label: genre,
    };
  });
  genreSelectionOptions.unshift({value: 'any', label: 'any genre'});

  return (
    <div className="input-wrapper input-wrapper--horizontal">
      <label className="nav__heading">Genre: (optional)</label>
      <Select
        value={{
          value: config.genre,
          label: config.genre,
        }}
        onChange={e => {
          configDispatch({type: 'GENRE', genre: e.value});
        }}
        options={genreSelectionOptions}
      />
    </div>
  );
};
export default Genre;
