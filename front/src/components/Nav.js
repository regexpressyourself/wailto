import React, {useState, useContext} from 'react';
import DayPicker from 'react-day-picker';
import {ConfigContext} from '../context/ConfigContext';
import 'react-day-picker/lib/style.css';
import './nav.scss';

const getData = () => {
  console.log('getdata');
};
function Nav(props) {
  const {config, configDispatch} = useContext(ConfigContext);

  let [username, setUsername] = useState('');

  return (
    <nav className="nav">
      <label htmlFor='username'>Username</label>
      <input
        name="username"
        type="text"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <div className="nav__date-pickers">
        <div>
          <h2>From:</h2>
          <DayPicker
            selectedDays={config.timeStart}
            onDayClick={e => {
              configDispatch({type: 'TIME_START', timeStart: e});
            }}
          />
        </div>
        <div>
          <h2>To:</h2>
          <DayPicker
            selectedDays={config.timeEnd}
            onDayClick={e => {
              configDispatch({type: 'TIME_END', timeEnd: e});
            }}
          />
        </div>
      </div>
      <button onClick={getData}>Submit</button>
    </nav>
  );
}

export default Nav;
