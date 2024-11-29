// const path = require('path')
// const isDev = process.env.NODE_ENV === 'development'

// module.exports = {
//   publicPath: isDev ? '' : '/hyy-vue3-mindmap/',
//   outputDir: './dist', // 打包dist所在路径
//   lintOnSave: false,
//   productionSourceMap: false,
//   transpileDependencies: ['simple-mind-map'],
//   filenameHashing: false,
//   configureWebpack: {
//     resolve: {
//       alias: {
//         '@': path.resolve(__dirname, './src/')
//       }
//     }
//   }
// }
const path = require('path')
const isDev = process.env.NODE_ENV === 'development'

module.exports = {
  publicPath: isDev ? '/' : '/',
  outputDir: './dist', // 打包dist所在路径
  lintOnSave: false,
  productionSourceMap: false,
  transpileDependencies: ['simple-mind-map'],
  filenameHashing: false,
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src/')
      }
    }
  }
}
