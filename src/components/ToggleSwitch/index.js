import React from 'react';
import styles from './ToggleSwitch.module.scss';

const ToggleSwitch = ({ isDark, onChange }) => (
  <div className={styles['switch']}>
    <input type="checkbox" id="switch" checked={isDark} onChange={onChange} aria-label="Switch between Dark and Light mode" />
    <label htmlFor="switch">
      <span>🌙</span>
      <span>☀️</span>
    </label>
  </div>
);

export default ToggleSwitch;