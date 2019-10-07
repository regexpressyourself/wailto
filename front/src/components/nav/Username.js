import React, {useState, useEffect, useContext} from 'react';
import {ConfigContext} from '../../context/ConfigContext';
import {inputAttention} from './navControls';

const Username = () => {
  const {config, configDispatch} = useContext(ConfigContext);
  let [username, setUsername] = useState(config.username);

  useEffect(() => {
    if (config.username === 'zookeeprr') {
      let zookeeprr = 'zookeeprr';
      inputAttention(true, 'username');
      for (let i = 1; i <= zookeeprr.length; i++) {
        setTimeout(() => {
          setUsername(zookeeprr.substring(0, i));
        }, 50 * i);
      }
    } else {
      inputAttention(false, 'username');
      setUsername(config.username);
    }
  }, [config.username]);

  return (
    <div className="nav__username input-wrapper">
      <label className="nav__heading nav__heading--username" htmlFor="username">
        Username&nbsp;
        <a href="https://www.last.fm/join" rel="noopener noreferrer" target="_blank">
          <span className="clickable header-help-link">(Need a username?)</span>
        </a>
      </label>
      <input
        name="username"
        className="username-input"
        placeholder="Last.fm username"
        type="text"
        value={username}
        onChange={e => {
          configDispatch({type: 'USERNAME', username: e.target.value});
        }}
      />
    </div>
  );
};
export default Username;
