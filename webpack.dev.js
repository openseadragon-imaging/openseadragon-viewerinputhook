const path = require('path');
const merge = require('webpack-merge').merge;
const common = require('./webpack.common.js');

module.exports = merge(common, {
	mode: 'development',
	devtool: 'source-map', //'inline-source-map',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'openseadragon-viewerinputhook.js',
		library: 'openseadragon-viewerinputhook',
		libraryTarget: 'umd',
		libraryExport: 'default'
	},
	plugins: []
});
