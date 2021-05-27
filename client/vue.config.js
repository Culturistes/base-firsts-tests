module.exports = {
    chainWebpack: config => {
      config.module.rule('eslint').use('eslint-loader').options({
        fix: true
      })
    },
    css: {
      loaderOptions: {
        sass: {
          prependData: `
            @import "@/assets/scss/__index.scss";
          `
        }
      }
    }
  }