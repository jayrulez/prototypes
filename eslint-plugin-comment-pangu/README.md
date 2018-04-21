# eslint-plugin-comment-pangu

Pangu whitespace for Chinese comments.

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-comment-pangu`:

```
$ npm install eslint-plugin-comment-pangu --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-comment-pangu` globally.

## Usage

Add `comment-pangu` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "comment-pangu"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "comment-pangu/rule-name": 2
    }
}
```

## Supported Rules

* Fill in provided rules here





