import React from 'react';
import { getContactHref, getIcon } from 'utils';
import Icon from 'components/Icon';
import styles from './Socials.module.scss';

const Socials = ({ contacts }) => (
  <div className={styles['socials']}>
    <ul className={styles['socials__list']}>
      {Object.keys(contacts).map((name, idx) => (
        <li className={styles['socials__list-item']} key={`§{name}-${idx}`}>
          <a
            className={styles['socials__list-item-link']}
            href={getContactHref(name, contacts[name])}
            rel="noopener noreferrer"
            target="_blank"
            title={name}
          >
            <Icon icon={getIcon(name)} />
          </a>
        </li>
      ))}
    </ul>
  </div>
);

export default Socials;
