## Webpack Image Placeholder Plugin

In JavaScript, import "\<width in pixel\>x\<height in pixel\>.png"
```javascript
import placeholder from "200x300.png";

const element = document.createElement("img");
element.src = placeholder;
document.body.appendChild(element);
```

This will generate image with specific width and height automatically.

![image](https://user-images.githubusercontent.com/6715543/209969478-cb57dbd9-fdf9-4bca-831f-2bfe2d670357.png)

### Install
```bash
  npm i --save-dev webpack-image-placeholder-plugin
```

### Webpack configuration 
```javascript
const ImagePlaceholderPlugin = require("webpack-image-placeholder-plugin");

module.exports = {
  // ...
  plugins: [new ImagePlaceholderPlugin()]
};
```


