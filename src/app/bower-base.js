// one way we can do plugins is to make them separate repos in the github realize org.
// That way we could use the bower back-end code for managing our plugin repo and dependencies
//
//
//
var bowerjson = {
// See https://github.com/bower/bower.json-spec for property descriptions
  private:true, // prevent publishing
  version: '0.0.0', // The package's semantic version number.
  location: '', // The endpoint where Bower can find your package. Used during registration.
  description: "default plugin description", // Max 140 chars - Helps users identify and search for your package.
  keywords: ["realize", "plugin"], // Used for search by keyword. Helps make your package easier to discover without people needing to know its name.
  main:'bower.json', //The primary acting files necessary to use your package.  listed with the commands bower list --json and bower list --paths, for build tools.
  ignore:'',
  "authors": [
    { "name": "John Doe" },
    { "name": "John Doe", "email": "john@doe.com" },
    { "name": "John Doe", "email": "john@doe.com"," homepage": "http://johndoe.com" }
  ],
  homepage: '',// URL to learn more about the package. Falls back to GitHub project if undefined
  issues: {"mail": "dev@example.com", "web": "http://www.example.com/issues"},
  licenses: [
    {"type": "MIT", "url": "http://www.example.org/licenses/mit.html"}
  ],
  "repository": {
    "type": "git",
    "url": "git://github.com/foo/bar.git"
  },
  dependencies:{},
  devDependencies:{}
};