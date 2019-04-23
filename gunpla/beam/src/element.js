export const createElement = (state, ...plugins) => ({
  codes: {},
  plugins: plugins.reduce(
    (map, plugin) => ({ ...map, [plugin.name]: plugin }), {}
  ),
  bufferPropsMap: {},
  state
})
