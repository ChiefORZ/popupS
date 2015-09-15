'use strict';

module.exports = function (grunt){
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        export: {
            src: "src/main.js",
            dst: "dist/popupS.js"
        },

        watch: {
            scripts: {
                files: ['src/**/*.*', 'css/popupS.css'],
                tasks: ['default'],
                options: { interrupt: true }
            }
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= pkg.version %> - <%= pkg.license %>*/\n'
            },
            dist: {
                files: {
                      'dist/<%= pkg.name %>.min.js': ['dist/popupS.js']
                }
            }
        },

        cssmin: {
            options: {
                shorthandCompacting: false,
                roundingPrecision: -1
            },
            target: {
                files: {
                    'css/popupS.min.css': ['css/popupS.css']
                }
            }
        }
    });

    grunt.registerTask('export', 'Export js', function () {
        function file(rel, name) {
            return rel.split('/').slice(0, -1).concat(name).join('/') + '.js';
        }

        function parse(src, pad) {
            grunt.log.writeln((pad || '') + 'Parse file:', src);

            return grunt.file.read(src)
                .replace(/module\.exports\s*=\s*([\s\S]+);/, '$1')
                .replace(/require\('(.*?)'\);?/g, function (_, name) {
                    return parse(file(src, name), '  ');
                })
                .replace(/\/+\s+&import\s+"(.*?)".*?\n/g, function (_, name) {
                    return parse(file(src, name), '  ');
                })
                .trim()
            ;
        }

        var config = grunt.config(this.name);
        var content = parse(config.src).replace(/;;;[^\n]+/g, '');

        grunt.log.writeln(new Array(50).join('-'));
        grunt.log.oklns('Write file:', config.dst);

        grunt.file.write(config.dst, content);
    });

    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('js', ['export']);
    grunt.registerTask('min', ['uglify']);
    grunt.registerTask('css', ['cssmin']);
    grunt.registerTask('default', ['js', 'min', 'css']);
};
