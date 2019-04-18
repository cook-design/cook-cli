const contentTmpl = './template/Content/index';

// md解析 babel配置
const pluginAntdConfig = {
  noPreview: false,
  pxtorem: false,
  babelConfig: JSON.stringify({
    "presets": [
      require.resolve("@babel/preset-react"),
      [
        require.resolve("@babel/preset-env"),
        {
          "targets": {
            "browsers": [
              "last 2 versions",
              "Firefox ESR",
              "> 1%",
              "ie >= 8",
              "iOS >= 8",
              "Android >= 4"
            ]
          }
        }
      ]
    ],
    "plugins": [
      require.resolve("@babel/plugin-proposal-class-properties"),
      require.resolve("@babel/plugin-proposal-object-rest-spread"),
      [require.resolve('babel-plugin-import'), {
        libraryName: 'antd',
        style: true,
      }, 'antd'],
      [require.resolve('babel-plugin-import'), {
        libraryName: 'antd-mobile',
        style: true,
      }, 'antd-mobile'],
      [require.resolve('babel-plugin-import'), {
        libraryName: '@alipay/qingtai',
        style: true,
      }, '@alipay/qingtai'],
      [require.resolve('babel-plugin-import'), {
        libraryName: '@alipay/cook',
        style: true,
      }, '@alipay/cook'],
      [require.resolve('babel-plugin-import'), {
        libraryName: 'kb-cook',
        libraryDirectory: "es",
        style: true,
      }, 'kb-cook'],
    ]
  }),
};

module.exports = {
  plugins: [
    `bisheng-plugin-cook?${JSON.stringify(pluginAntdConfig)}`,
  ],
  routes: {
    path: '/',
    component: './template/Layout/index',
    indexRoute: { component: contentTmpl },
  },
};
