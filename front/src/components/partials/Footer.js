import React from 'react';
import {GitHub} from 'react-feather';
import {Link} from 'react-router-dom';
import './Footer.scss';
import sm from '../../assets/sm.png';

const Footer = () => {
  const inlineLogo = <span className="logo-font">WAILto</span>;
  return (
    <footer>
      <div>
        <Link className="footer-img" to="/">
          <p className="css-logo">
            <span className="css-logo__wail">WAIL</span>
            <span className="css-logo__to">to</span>
          </p>
        </Link>
      </div>
      <div>
        <p className="footer-p">
          <a
            href="https://github.com/regexpressyourself/wailto"
            className="footer-gh-link"
            rel="noopener noreferrer"
            target="_blank">
            <GitHub />
            {inlineLogo} &nbsp;is 100% open source
          </a>
        </p>
      </div>
      <div className="smessina-info">
        <p className="footer-p">
          <a
            href="https://smessina.com"
            rel="noopener noreferrer"
            target="_blank">
            Sam Messina
            <br />
            &copy; {new Date().getFullYear()}
          </a>
        </p>
        <p>
          <a
            className="footer-img"
            href="https://smessina.com"
            rel="noopener noreferrer"
            target="_blank">
            <img className="sm-fav" src={sm} alt="smessina.com" />
          </a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
