# Git-Lib
Wrapper around the git command line executable

### Install
With **yarn**
```bash
yarn add @keg-hub/git-lib
```
With **npm**
```bash
npm install @keg-hub/git-lib
```

## Setup
* Requires git to be installed, and on the `$PATH`


## Example
```js
// Beginning of your code
const { git } = require('@keg-hub/git-lib')

// ...Modify some files, save them, then...

// Add the changed files...
await git.add({
  files: [ '.' ],
  // Optional, uses process.cwd() when not passed
  root: `path/to/git/directory`,
})

// Commit the changed files...
await git.commit({
  message: `Changed some files`,
  // Optional, uses process.cwd() when not passed
  root: `path/to/git/directory`,
})

// Push the changed files...
await git.push({
  // Optional, uses the current working branch
  to: `remote-branch-name`,
  // Optional, default is origin
  remove: 'upstream',
  // Optional, uses process.cwd() when not passed
  root: `path/to/git/directory`,
})
```

## API
### TODO
