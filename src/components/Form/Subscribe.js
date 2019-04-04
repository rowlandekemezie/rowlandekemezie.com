import React from 'react';
import styles from './Subscribe.module.scss';

export const Subscribe = () => (
  <div className={styles['subscribe']}>
    <form
      className={styles['subscribe__form']}
      action="https://tinyletter.com/rowland"
      method="post"
      target="popupwindow"
      onSubmit={() => {
        window.open(
          'https://tinyletter.com/rowland',
          'popupwindow',
          'scrollbars=yes,width=800,height=600'
        );
        return true;
      }}
    >
      <h5 className={styles['subscribe__header']}>
        Want more articles? Subscribe to my newsletter
      </h5>
      <div className={styles['subscribe__inputwrapper']}>
        <label htmlFor="tlemail" className={styles['subscribe__label']}>
          Email address:
        </label>
        <input
          aria-label="your email address"
          aria-required="true"
          placeholder="john@doe.com"
          type="email"
          name="email"
          id="tlemail"
          className={styles['subscribe__input']}
        />
      </div>
      <input type="hidden" value="1" name="embed" />
      <button className={styles['subscribe__button']} type="submit">
        Subscribe
      </button>
    </form>
  </div>
);

export default Subscribe;
