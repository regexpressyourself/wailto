import React, {useState, useEffect, useContext} from 'react';
import {ConfigContext} from '../../context/ConfigContext';

const animateUsername = animate => {
  if (animate) {
    document
      .querySelector('.nav__heading--username')
      .classList.add('atn--font-color');
    document
      .querySelector('.username-input')
      .classList.add('atn--border-color');
  } else {
    document
      .querySelector('.nav__heading--username')
      .classList.remove('atn--font-color');
    document
      .querySelector('.username-input')
      .classList.remove('atn--border-color');
  }
};

const Username = () => {
  const {config, configDispatch} = useContext(ConfigContext);
  let [username, setUsername] = useState(config.username);

  useEffect(() => {
    if (config.username === 'zookeeprr') {
      let zookeeprr = 'zookeeprr';
      animateUsername(true);
      for (let i = 1; i <= zookeeprr.length; i++) {
        setTimeout(() => {
          setUsername(zookeeprr.substring(0, i));
        }, 50 * i);
      }
    } else {
      animateUsername(false);
      setUsername(config.username);
    }
  }, [config.username]);

  return (
    <div className="nav__username input-wrapper">
      <label className="nav__heading nav__heading--username" htmlFor="username">
        Username&nbsp;
        <a
          href="https://www.last.fm/join"
          rel="noopener noreferrer"
          target="_blank">
          <span className="clickable header-help-link">(Need a username?)</span>
        </a>
      </label>
      <span className="required-reminder">
        &nbsp;&mdash;&nbsp;please enter a username
      </span>
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
}
export default Username;
