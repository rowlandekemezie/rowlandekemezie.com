import React from 'react';
import formatReadingTime from 'utils';
import styles from './Meta.module.scss';

const Meta = ({ date, timeToRead }) => (
  <div className={styles['meta']}>
    <p className={styles['meta__date']}>
      {date} &bull; {formatReadingTime(timeToRead)}
    </p>
  </div>
);

export default Meta;
