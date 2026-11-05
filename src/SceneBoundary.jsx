import React from 'react';

// A decorative scene must never prevent access to the shop if WebGL or its chunk fails.
export default class SceneBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
