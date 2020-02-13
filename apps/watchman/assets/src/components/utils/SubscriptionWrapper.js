import React from 'react'

class SubscriptionWrapper extends React.Component {
  UNSAFE_componentWillMount() {
    this.reregister()
  }

  UNSAFE_componentWillReceiveProps(props) {
    if (props.id !== this.props.id) {
      console.log(`subscribing to ${props.id}`)
      this._unsubscribe()
      this.unsubscribe = props.startSubscription()
    }
  }

  componentWillUnmount() {
    this._unsubscribe()
  }

  _unsubscribe() {
    if (this.unsubscribe) {
      console.log(`unsubscribing from ${this.props.id}`)
      this.unsubscribe()
      this.unsubscribe = null
    }
  }

  reregister() {
    if (this.unsubscribe) return
    console.log(`subscribing to ${this.props.id}`)
    this.unsubscribe = this.props.startSubscription()
  }

  render() {
    return this.props.children
  }
}

export default SubscriptionWrapper