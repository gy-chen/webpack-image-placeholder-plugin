const fs = require('fs');
const path = require("path");
const sharp = require("sharp");

function getOutputPath(filename) {
  return path.join(__dirname, filename);
}

function createCenterText(width, height) {
  return Buffer.from(`
  <svg width="${width}" height="${height}">
    <rect width="100%" height="100%" fill="#aaaaaa" />
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#222222" font-size="24">${width} x ${height}</text>    
  </svg>
  `);
}

class ImagePlaceholderResolverPlugin {
  constructor() {}

  apply(resolver) {
    const pluginName = "ImagePlaceholderResolverPlugin";
    const target = resolver.ensureHook("internal-resolve");
    resolver.getHook("resolve").tapAsync(
        {
          name: pluginName,
          stage: -99,
        },
        (request, resolveContext, callback) => {
          const basename = request.request;
          if (!basename) return callback();
          const matchResult = basename.match(/^(\d+)x(\d+).(.*?)$/);
          if (!matchResult) return callback();

          const width = parseInt(matchResult[1]);
          const height = parseInt(matchResult[2]);
          const ext = matchResult[3];

          const outputPath = getOutputPath(basename);
          function doResolve(err) {
            if (err) return callback(err);

            const newRequest = {
              ...request,
              request: `webpack-image-placeholder-plugin/${basename}`
            };
            resolver.doResolve(
                target,
                newRequest,
                null,
                resolveContext,
                callback
            );
          }

          if (fs.existsSync(outputPath)) return doResolve();

          const centerText = createCenterText(width, height);
          sharp({
            create: {
              width: width,
              height: height,
              channels: 3,
              background: { r: 255, g: 255, b: 255 },
            },
          })
              .composite([
                {
                  input: centerText,
                  blend: "over",
                },
              ])
              [ext]()
              .toFile(outputPath, doResolve);
        }
    );
  }
}

class ImagePlaceholderPlugin {
  constructor() {}

  apply(compiler) {
    const pluginName = "ImagePlaceholderPlugin";

    compiler.hooks.afterResolvers.tap(pluginName, (compiler) => {
      compiler.resolverFactory.hooks.resolver
          .for("normal")
          .tap(pluginName, (resolver) => {
            const imagePlaceholderResolverPlugin =
                new ImagePlaceholderResolverPlugin();
            imagePlaceholderResolverPlugin.apply(resolver);
          });
    });
  }
}

module.exports = ImagePlaceholderPlugin;
