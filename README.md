# [Realize](https://github.com/realizeapp/realize-ui-angular) [![Build Status](https://travis-ci.org/realizeapp/realize-ui-angular.png?branch=master)](https://travis-ci.org/realizeapp/realize-ui-angular)

***

## Overview

This is the UI component of [Realize](http://www.realize.pe).  Please see the [core repo](https://github.com/realizeapp/realize-core) for the backend server and full install/usage instructions.

## Quick Start (Frontend only)

[Install Node.js](http://nodejs.org/) and then:

```sh
(Note: on Windows, you can ignore the "sudo" part)
$ git clone git@github.com:realizeapp/realize-ui-angular.git    # copy repo to your computer
$ cd realize-ui-angular    # change to inside directory
$ sudo npm -g install grunt-cli karma bower    # installs grunt-cli,karma,bower
$ sudo npm install    # installs node dependencies in a /node_modules/ directory
$ bower install    # installs js/css dependencies in your /bower_components/ directory
$ grunt dev   # starts the dev environment
```
After typing ```grunt dev```, you should see the unit test runner open a new Chrome browser window.
Click [http://localhost:8000/app](http://localhost:8000/app) to open the application in your default browser.

And Boom!  You're set up to hack on any of the project's HTML/JavaScript/AngularJS code.  Making changes to those files in the src/ directory will also reload your page automatically.  Happy hacking!

### Detailed Installation

This section provides a little more detailed understanding of what goes into
getting `realize` up and running. Though `realize` is really simple
to use, it might help to have an understanding of the tools involved here, like
Node.js and Grunt and Bower. If you're completely new to highly organized,
modern JavaScript development, take a few short minutes to read [this overview
of the tools](tools.md) before continuing with this section.

Okay, ready to go? Here it is:

`realize` uses [Grunt](http://gruntjs.org) as its build system, so
[Node.js](http://nodejs.org) is required. Also, Grunt by default no longer comes
with a command-line utility and Karma and Bower must end up in your global path
for the build system to find it, so they must be installed independently. Once
you have Node.js installed, you can simply use `npm` to make it all happen:

```sh
$ npm -g install grunt-cli karma bower
```

If you're on Linux then throw `sudo` in front of that command.

Next, you can either clone this repository using Git, download it as a zip file
from GitHub, or merge the branch into your existing repository. Assuming you're
starting from scratch, simply clone this repository using git:

```sh
$ git clone git@github.com:realizeapp/realize-ui-angular.git
$ cd realize-ui-angular
```

And then install the remaining build dependencies locally:

```sh
$ npm install
```

This will read the `dependencies` (empty by default) and the `devDependencies`
(which contains our build requirements) from `package.json` and install
everything needed into a folder called `node_modules/`.

There are many Bower packages used by `realize`, like Twitter Bootstrap
and Angular UI, which are listed in `bower.js`. To install them into the
`bower_components/` directory, simply run:

```sh
$ bower install
```

In the future, should you want to add a new Bower package to your app, run the
`install` command:

```sh
$ bower install packagename --save-dev
```

The `--save-dev` flag tells Bower to add the package at its current version to
our project's `bower.js` file so should another developer download our
application (or we download it from a different computer), we can simply run the
`bower install` command as above and all our dependencies will be installed for
us. Neat!

Technically, `realize` is now ready to go.

However, prior to hacking on your application, you will want to modify the
`package.json` file to contain your project's information. Do not remove any
items from the `devDependencies` array as all are needed for the build process
to work.

To ensure your setup works, launch grunt:

```sh
$ grunt dev
```

For a deeper look at the build process, read the thoroughly commented Gruntfile.js.
The built files are placed in the `build/` directory by default.

When you're ready to push your app into production, just run `grunt` by itself:

```sh
$ grunt
```

This will build, concatenate and minify your sources and place them by default into the
`dist/` directory.

### The Build System

The best way to learn about the build system is by familiarizing yourself with
Grunt and then reading through the heavily documented build script,
`Gruntfile.js`. But you don't need to do that to be very productive with
`realize`. What follows in this section is a quick introduction to the
tasks provided and should be plenty to get you started.  TODO, generate this from the
Gruntfile.js 'build' section comments

### Build vs. Compile

To make the build even faster, tasks are placed into two categories: build and
compile. The build tasks (like those we've been discussing) are the minimal
tasks required to run your app during development.

Compile tasks, however, get your app ready for production. The compile tasks
include concatenation, minification, compression, etc. These tasks take a little
bit longer to run and are not at all necessary for development so are not called
automatically during build or watch.

To initiate a full compile, you simply run the default task:

```sh
$ grunt
```

This will perform a build and then a compile. The compiled site - ready for
uploading to the server! - is located in `dist/`. To test that your full site works as
expected, open the same url as for build - ```http://localhost:8000/app``` in your browser. Voila!

### Continuous Integration

We're currently using Travis-CI for integration.

## Roadmap

We don't have a roadmap yet, but will be working on one in the future.

## Contributing
If you're new to open source development, check out jQuery's [Getting Started Contributing](http://contribute.jquery.org/open-source/)

Then check out [Contributing](CONTRIBUTING.md)

<a name="communication"></a>
### Communication

**Chat**

We have an IRC channel at #realize on freenode.  Use [this cool](http://webchat.freenode.net/?nick) web IRC client to join.

**Application issues/feedback **

Via our [Github Repository](https://github.com/realizeapp/realize-ui-angular/issues).  Feel free to submit issues if you find bugs or see something that needs doing.  Even better, do it and submit a pull request. :)

### Licensing
By submitting a patch, you agree to license your work under the same license as that used by the project.