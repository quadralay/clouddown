var spawn = require('child_process').spawn
var bump = require('gulp-bump')
var util = require('gulp-util')
var standard = require('gulp-standard')

module.exports = function (gulp) {
  gulp.task('lint', function () {
    return gulp.src(['**/*.js', '!node_modules/**', '!dist/**', '!**/*-min.js'])
      .pipe(standard())
      .pipe(standard.reporter('default', {
        breakOnError: true
      }))
  })

  gulp.task('patch', bumpTask('patch'))
  gulp.task('minor', bumpTask('minor'))
  gulp.task('major', bumpTask('major'))

  function bumpTask (importance) {
    return function () {
      return gulp.src([
        './package.json'
      ])
        .pipe(bump({
          type: importance
        }))
        .pipe(gulp.dest('./'))
    }
  }
  return gulp
}

function exec (cmds, options, cb) {
  if (cb === undefined) {
    cb = options
    options = {}
  }
  if (!(cmds instanceof Array)) {
    cmds = [cmds]
  }
  if (cmds.length === 0) {
    return cb()
  }
  var file, args
  var command = cmds.shift()
  options = require('util')._extend({
    cwd: process.cwd()
  }, options)
  // Credit: https://github.com/nodejs/node/blob/master/lib/child_process.js
  if (process.platform === 'win32') {
    file = process.env.comspec || 'cmd.exe'
    args = ['/s', '/c', '"' + command + '"']
    options.windowsVerbatimArguments = true
  } else {
    file = '/bin/sh'
    args = ['-c', command]
  }
  var proc = spawn(file, args, options)
  proc.stdout.pipe(process.stdout)
  proc.stderr.pipe(process.stderr)
  proc.on('error', function (error) {
    util.log(util.colors.red(error))
    cb(error)
  })
  proc.on('exit', function (code) {
    if (code) {
      return cb(code)
    }
    exec(cmds, cb)
  })
}

module.exports.exec = exec
module.exports.util = util
