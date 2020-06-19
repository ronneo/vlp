// Build script
const fs = require('fs')
const fse = require('fs-extra')

const childProcess = require('child_process')
if (fs.existsSync('./server/build')) {
	fse.removeSync('./server/build')
}

// Run 'react-scripts build' script
childProcess.execSync('react-scripts build', { stdio: 'inherit' })

// Move app build to server/build directory
fse.moveSync('./build', './server/build', { overwrite: true })