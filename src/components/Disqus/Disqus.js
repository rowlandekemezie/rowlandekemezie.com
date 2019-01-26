import React, { Component } from 'react'
import ReactDisqusComments from 'react-disqus-comments'
import urljoin from 'url-join'
import config from '../../../data/siteConfig'

class Disqus extends Component {
  constructor(props) {
    super(props)
    this.state = {
      toasts: [],
    }
    this.notifyAboutComment = this.notifyAboutComment.bind(this)
    this.onSnackbarDismiss = this.onSnackbarDismiss.bind(this)
  }

  onSnackbarDismiss() {
    const { props } = this.state
    const [, ...toasts] = props
    this.setState({ toasts })
  }

  notifyAboutComment() {
    const { toasts } = this.state
    toasts.push({ text: 'New comment available!' })
    this.setState({ toasts: toasts.slice() })
  }

  render() {
    const { postNode } = this.props
    if (!config.disqusShortname) {
      return null
    }
    const post = postNode.frontmatter
    const url = urljoin(config.siteUrl, config.pathPrefix, postNode.fields.slug)
    return (
      <ReactDisqusComments
        shortname={config.disqusShortname}
        identifier={post.title}
        title={post.title}
        url={url}
        category_id={post.category_id}
        onNewComment={this.notifyAboutComment}
      />
    )
  }
}

export default Disqus
