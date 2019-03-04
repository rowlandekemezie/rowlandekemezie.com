import React from 'react'
import classNames from 'classnames/bind'
import {
  TwitterShareButton,
  LinkedinShareButton,
  FacebookShareButton
} from 'react-share';

import styles from './Share.module.scss';
const cx = classNames.bind(styles);

const Share = ({ url, title, twitterHandle }) => (
  <div className={styles['share']} >
     <div className={styles['share__divider']}/>
     <span className={styles['share__text']}>Share article</span>
     <TwitterShareButton
       url={url}
       quote={title}
       via={twitterHandle.split('@').join('')}
       className={styles['share__social-icon']}
     >
       Twitter
     </TwitterShareButton>
     <FacebookShareButton
       url={url}
       quote={title}
       via={twitterHandle.split('@').join('')}
       className={cx({
         'share__social-icon': true,
         'share__social-icon-last': true
        })}
     >
       Facebook
     </FacebookShareButton>
   </div>

)

export default  Share;