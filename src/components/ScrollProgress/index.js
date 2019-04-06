import React, { useState, useEffect } from 'react';
import styles from './ScrollProgress.module.scss';


const ScrollProgress = () => {
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const b = document.body;
      const st = 'scrollTop';
      const sh = 'scrollHeight';

      const scroll = parseInt((h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight) * 100, 10);
      setScroll(scroll);
    };
    document.addEventListener('scroll', onScroll);
    return () => document.removeEventListener('scroll', onScroll);
  });

  return <div className={styles['scroll']} style={{ width: `${scroll}%` }} />;
};


export default ScrollProgress;