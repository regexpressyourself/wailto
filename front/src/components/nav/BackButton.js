import React, {useContext} from 'react';
import {ChevronLeft} from 'react-feather';
import {ConfigContext} from '../../context/ConfigContext';

function BackButton(props) {
  const {configDispatch} = useContext(ConfigContext);
  return (
    <button
      className="nav__back-btn"
      onClick={e => {
        configDispatch({type: 'APP_STATE', appState: 'dashboard'});
        configDispatch({
          type: 'TRIGGER_STATE_UPDATE',
          triggerStateUpdate: true,
        });
      }}>
      <ChevronLeft />
    </button>
  );
}
export default BackButton;
