const webpack = require('webpack')

module.exports = function override(config, env) {
  // Dependency fallback management
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    stream: require.resolve('stream-browserify'),
    crypto: require.resolve('crypto-browserify'),
    buffer: require.resolve('buffer'),
  });
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    })
  ];

  config.resolve.fallback = fallback;
  config.ignoreWarnings = [/Failed to parse source map/];  // gets rid of a billion source map warnings
  return config;
}
