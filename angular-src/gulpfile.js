var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    del = require('del'),
    notify = require('gulp-notify'),
    browserSync = require('browser-sync'),
    reload      = browserSync.reload,
    harp = require('harp');

var paths = {
    scripts: ['src/**/*.js'],
    html: ['src/**/*.html'], 
    dist: '../src/main/resources/static/'
};

gulp.task('styles', function() {
    return sass('src/**/*.scss', { style: 'expanded' })
    .pipe(gulp.dest(paths.dist))
    .pipe(notify({ message: 'Styles task complete' }))
});

gulp.task('js', function() {
  gulp.src(paths.scripts)
      .pipe(gulp.dest(paths.dist));
});

gulp.task('html', function() {
  gulp.src(paths.html)
      .pipe(gulp.dest(paths.dist));
});

gulp.task('browser-sync', function() {
  browserSync({
    proxy: 'localhost:9000'
  })
});

gulp.task('watch', function() {
  // Watch .scss files
  gulp.watch('src/**/*.scss', ['styles']);
  gulp.watch('src/**/*.js', ['js']);
  gulp.watch('src/**/*.html', ['html']);
  
  gulp.watch(['src/**']).on('change', function() {
    setTimeout( function() {
      reload(paths.dist, {stream: true});
    }, 300);
  });
});


gulp.task('build', function() {
    gulp.start('styles');
    gulp.start('js');
    gulp.start('html');
});

gulp.task('clean', function() {
    return del([paths.dist], { force : true });
});

gulp.task('default', ['clean'], function() {
    gulp.start('styles');
    gulp.start('js');
    gulp.start('html');
    // gulp.start('browser-sync');
    // gulp.start('watch');
});