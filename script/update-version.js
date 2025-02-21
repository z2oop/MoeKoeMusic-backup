const fs = require("fs");
const path = require("path");
const commitMessageFile = process.argv[2];
const commitMessage = fs.readFileSync(commitMessageFile, "utf8").trim();
if (!commitMessage.includes("release")) {
  console.log("No 'release' found in commit message. Skipping version update.");
  process.exit(0); 
}
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const versionArray = packageJson.version.split('.').map(Number);
if (versionArray[2] === 9) {
  versionArray[1] += 1;
  versionArray[2] = 0; 
} else {
  versionArray[2] += 1;
}
packageJson.version = versionArray.join('.');
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
console.log(`Updated package.json version to ${packageJson.version}`);