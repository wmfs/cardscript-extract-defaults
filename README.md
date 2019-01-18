# cardscript-extract-defaults

[![Tymly Cardscript](https://img.shields.io/badge/tymly-cardscript-blue.svg)](https://tymly.io/)
[![Build Status](https://travis-ci.com/wmfs/cardscript-extract-defaults.svg?branch=master)](https://travis-ci.com/wmfs/cardscript-extract-defaults)
[![npm (scoped)](https://img.shields.io/npm/v/@wmfs/cardscript-extract-defaults.svg)](https://www.npmjs.com/package/@wmfs/cardscript-extract-defaults) 
[![codecov](https://codecov.io/gh/wmfs/cardscript-extract-defaults/branch/master/graph/badge.svg)](https://codecov.io/gh/wmfs/cardscript-extract-defaults) 
[![CodeFactor](https://www.codefactor.io/repository/github/wmfs/cardscript-extract-defaults/badge)](https://www.codefactor.io/repository/github/wmfs/cardscript-extract-defaults) 
[![Dependabot badge](https://img.shields.io/badge/Dependabot-active-brightgreen.svg)](https://dependabot.com/) 
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/) 
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) 
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/wmfs/tymly/blob/master/packages/concrete-paths/LICENSE)

> Extracts sensible defaults from some Cardscript.

## <a name="install"></a>Install
```bash
$ npm install cardscript-extract-defaults --save
```

## <a name="usage"></a>Usage

```javascript
const extractDefaults = require('@wmfs/cardscript-extract-defaults')

const defaultValues = extractDefaults(
    {
      "type": "AdaptiveCard",
      "body": [
        {
          "type": "TextBlock",
          "text": "Change me!",
          "color": "attention",
          "horizontalAlignment": "center"
        }
      ],
      "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
      "version": "1.0"
    }
)

```

## <a name="test"></a>Testing

```bash
$ npm test
```

## <a name="license"></a>License
[MIT](https://github.com/wmfs/cardscript/blob/master/LICENSE)
