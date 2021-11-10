import React from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";

const defaultOptions = {
  messageStyle: "none",
  extensions: ["tex2jax.js"],
  jax: ["input/TeX", "output/HTML-CSS"],
  tex2jax: {
    inlineMath: [
      ["$", "$"],
      ["\\(", "\\)"],
    ],
    displayMath: [
      ["$$", "$$"],
      ["\\[", "\\]"],
    ],
    processEscapes: true,
  },
  TeX: {
    extensions: [
      "AMSmath.js",
      "AMSsymbols.js",
      "noErrors.js",
      "noUndefined.js",
    ],
  },
  fontFamily: "san-serif",
  fontSize: 12,
};

class MathJax extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      height: 1,
    };
  }

  generateAssetsFontCss(fontFamily, fontSize) {
    const fileUri = Platform.select({
      ios: `${fontFamily}.ttf`,
      android: `file:///android_asset/fonts/${fontFamily}.ttf`,
    });

    return `
		@font-face {
			font-family: '${fontFamily}';
			src: local('${fontFamily}'), url('${fileUri}') format('truetype');
		}

		body {
			font-family: 'OpenSans-Regular';
			font-size: ${fontSize}px;
		}
		`;
  }

  handleMessage(message) {
    this.setState({
      height: Number(message.nativeEvent.data),
    });
  }

  wrapMathjax(content) {
    const { fontFamily, fontSize, mathJaxOptions } = this.props;

    const options = JSON.stringify(
      Object.assign({}, defaultOptions, mathJaxOptions)
    );

    const css = this.generateAssetsFontCss(fontFamily, fontSize);

    return `
			<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
			<script type="text/x-mathjax-config">
				MathJax.Hub.Config(${options});

				MathJax.Hub.Queue(function() {
					var height = document.documentElement.scrollHeight;
					window.ReactNativeWebView.postMessage(String(height));
					document.getElementById("formula").style.visibility = '';
				});
			</script>
			<style type="text/css">${css}</style>
			<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js"></script>
			<div id="formula" style="visibility: hidden;">
				${content}
			</div>
		`;
  }
  render() {
    const html = this.wrapMathjax(this.props.html);

    // Create new props without `props.html` field. Since it's deprecated.
    const props = Object.assign({}, this.props, { html: undefined });

    return (
      <View style={{ height: this.state.height, ...props.style }}>
        <WebView
          scrollEnabled={false}
          onMessage={this.handleMessage.bind(this)}
          source={{ html, baseUrl: "" }}
          originWhitelist={["*"]}
          {...props}
        />
      </View>
    );
  }
}

export default MathJax;
