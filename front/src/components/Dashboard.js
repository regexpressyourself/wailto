import React, {useContext} from 'react';
import {ConfigContext} from '../context/ConfigContext';
import {BookOpen, Calendar, Clock, Grid} from 'react-feather';
import './Dashboard.scss';

function Dashboard() {
  const {configDispatch} = useContext(ConfigContext);

  const modules = [
    {
      componentState: 'hour',
      title: 'Songs By Hour',
      subtitle: 'Learn what hours of the day have the most songs',
      image: <Clock />,
    },
    {
      componentState: 'dow',
      title: 'Songs By Day of Week',
      subtitle: 'See listening history for each day of the week.',
      image: <Calendar />,
    },
    {
      componentState: 'date',
      title: 'Songs By Date',
      subtitle: 'See a daily breakdown of listening history',
      image: <Grid />,
    },
    {
      componentState: 'history',
      title: 'Full History',
      subtitle: 'Every song in your selected date range',
      image: <BookOpen />,
    },
  ];

  let content = modules.map(module => {
    return (
      <div
        key={module.title}
        className="dashboard__module"
        onClick={e => {
          configDispatch({
            type: 'APP_STATE',
            appState: module.componentState,
          });
          configDispatch({
            type: 'TRIGGER_STATE_UPDATE',
            triggerStateUpdate: true,
          });
        }}>
        <div className="dashboard__module__heading">
          <div className="dashboard__module__image">{module.image}</div>
          <p className="dashboard__module__title">{module.title}</p>
        </div>
        <hr />
        <p className="dashboard__module__subtitle">{module.subtitle}</p>
      </div>
    );
  });

  return <section className="dashboard">{content}</section>;
}

export default Dashboard;
