import React, {useContext} from 'react';
import {ConfigContext} from '../context/ConfigContext';
import {accessibleJsTime} from '../functions/dateMappers';

const UserInfo = () => {
  const {config} = useContext(ConfigContext);

  let zookeeprrInfo =
    config.username === 'zookeeprr' ? (
      <div className="user-info__zookeeprr-info">
        <p>
          Welcome to my dashboard! That's me, <strong>zookeeprr</strong>.
        </p>
        <p>
          Check out some of my own music trends and history over the last week.
        </p>
        <p className="judgement-free">
          Remember, this is a judgement free zone.
          <br />
          <span className="shh">
            Yup, there will never be any Jonas Brothers on here. Definitely not.{' '}
            <span aria-label="see no evil" role="img">
              🙈
            </span>
          </span>
        </p>
      </div>
    ) : null;

  return (
    <section className="user-info">
      <p className="user-info__username">{config.username}</p>
      <div>
        <p className="user-info__dates">
          {accessibleJsTime(config.timeStart).date}
          &nbsp; &mdash; &nbsp;
          {accessibleJsTime(config.timeEnd).date}
        </p>
      </div>
      {zookeeprrInfo}
    </section>
  );
}
export default UserInfo;
