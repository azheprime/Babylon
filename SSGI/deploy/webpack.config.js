const path = require("path");
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const posthtml = require("posthtml");
const posthtmlInlineAssets = require("posthtml-inline-assets");


module.exports = {
    entry: "./src/testplugin.ts",
    mode: "development",
    output: {
        filename: "RealTimeGIPlugin.js",
        path: path.resolve(__dirname, "dist"),
        library: "VREdit_Module",
    },
    devServer: {
        hot: true, // 热更替
        open: true, // 直接用浏览器打开
        compress: false, //压缩
        port: 8000, // 设置端口
        static: {
            // static: ['assets']
            directory: path.join(__dirname, "dist"),
        },
    },
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                // 监听资源文件
                test: /\.(png|jpe?g)$/,
                // 设置资源类型
                type: "asset/inline",
            },
            {
                // 监听资源文件
                test: /\.babylon$/,
                // 设置资源类型
                type: "asset/source",
            },

            // {
            //     test: /\.html$/,
            //     loader: "html-loader",
            //     options: {
            //       preprocessor: async(content, loaderContext) => {
            //         let result;
            //         try {
            //           result =await posthtml([
            //             posthtmlInlineAssets({cwd:"src/templete"})
            //           ]).process(content);

            //         } catch (error) {
            //           loaderContext.emitError(error);
            //           return content;
            //         }
            //         return result.html;
            //       },
            //     },
            // },
        ],
    },
    plugins: [
       
    ],
    resolve: {
        extensions: [".ts", ".js", ".css", ".html"],
    },
    optimization: {
        // minimizer: [new UglifyJsPlugin({
        //     sourceMap: true,
        // })],
    },
};
