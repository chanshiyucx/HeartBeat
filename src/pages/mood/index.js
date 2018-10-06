import React, { PureComponent } from 'react'
import { connect } from 'dva'
import _ from 'lodash'
import Gitalk from 'gitalk'
import classNames from 'classnames/bind'

import Transition from '../../components/Transition'
import Loading from '../../components/Loading'
import Quote from '../../components/Quote'
import Segment from '../../components/Segment'
import config from '../../config'
import styles from './index.less'

const { gitalkOption, moodOption, themeColors } = config
const { enableGitalk, qoute } = moodOption
const cx = classNames.bind(styles)
const colors = _.shuffle(themeColors)

class Mood extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      showLoading: true,
      renderGitalk: false,
    }
  }

  componentDidMount() {
    this.next()
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.loading && nextProps.mood.length) {
      this.setState({ showLoading: false })
    }
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'global/updateState',
      payload: { mood: [] },
    })
  }

  // 前一页
  prev = () => {
    this.props.dispatch({
      type: 'global/queryMood',
      payload: { queryType: 'prev' },
    })
  }

  // 后一页
  next = () => {
    this.props.dispatch({
      type: 'global/queryMood',
      payload: { queryType: 'next' },
    })
  }

  // 卡片隐藏展示 Loading
  onHide = () => {
    this.setState({ showLoading: true })
  }

  // 渲染评论
  renderGitalk = () => {
    if (enableGitalk && !this.state.renderGitalk) {
      setTimeout(() => {
        const gitalk = new Gitalk({
          ...gitalkOption,
          title: '心情',
        })
        gitalk.render('gitalk')
      }, 100)
      this.setState({ renderGitalk: true })
    }
  }

  render({ totalMood, mood, loading }, { showLoading }) {
    const index = mood.length && totalMood.findIndex(o => o.id === mood[0].id)
    const page = index / 6 + 1
    const maxPage = Math.ceil(totalMood.length / 6)

    return (
      <div class={cx('container')}>
        <Transition
          visible={!loading && !showLoading}
          animation='drop'
          duration={600}
          onHide={this.onHide}
          onShow={this.renderGitalk}
        >
          <div class={cx('body')}>
            <Quote text={qoute} />
            <div class={cx('content')}>
              {mood.map((o, i) => {
                const date = o.created_at.slice(0, 10)
                const color = colors[i]
                return (
                  <Segment key={o.id} color={color} title={date} content={o.body} />
                )
              })}
            </div>
            <div class={cx('pagination')}>
              <button
                disabled={page <= 1}
                class={cx('prevBtn')}
                onClick={this.prev}
              >
                前一页
              </button>
              <span>{page}</span>
              <button
                disabled={page >= maxPage}
                class={cx('nextBtn')}
                onClick={this.next}
              >
                后一页
              </button>
            </div>
          </div>
        </Transition>

        {enableGitalk && <div id='gitalk' />}
        {showLoading && <Loading className={cx('loading')} />}
      </div>
    )
  }
}

export default connect(({ global, loading }) => ({
  totalMood: global.totalMood,
  mood: global.mood,
  loading: loading.effects['global/queryMood'],
}))(Mood)