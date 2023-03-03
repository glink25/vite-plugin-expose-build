rm -rf lib
npx esbuild src/index.ts --bundle --platform=node --packages=external --outfile=lib/index.js
npx esbuild src/utils.ts --bundle --platform=node --packages=external --outfile=lib/utils.js
cp -r src/ lib/