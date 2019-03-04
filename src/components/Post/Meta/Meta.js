import React from 'react';
import moment from 'moment';
import { formatReadingTime } from '../../../utils'
import styles from './Meta.module.scss';

const Meta = ({ date, timeToRead }) => (
  <div className={styles['meta']}>
    <p className={styles['meta__date']}>{moment(date).format('MMMM D, YYYY')} &bull; {formatReadingTime(timeToRead)}</p>
  </div>
);

export default Meta;
