'use strict';

var expect    = require('chai').expect,
    fs        = require('fs'),
    path      = require('path'),
    uncss     = require('./../lib/uncss.js');

/* Read file sync sugar. */
function rfs(file) {
    var filename = path.join(__dirname, file);
    if (fs.existsSync(filename)) {
        return fs.readFileSync(filename, 'utf-8');
    }
    return null;
}

var rawcss   = false,
    fixtures = fs.readdirSync(path.join(__dirname, 'selectors/fixtures')),
    expected = fs.readdirSync(path.join(__dirname, 'selectors/expected')),
    unused   = fs.readdirSync(path.join(__dirname, 'selectors/unused')),
    tests;

/* Build test object in the form:
 * [{
 *     fixture  : 'filename.css',
 *     expected : Boolean,
 *     unused   : Boolean
 *  }, {
 *   ...
 *  }, ...]
 */
tests = fixtures.map(function (test, i) {
    return {
        fixture  : test,
        expected : expected.indexOf(test) === -1 ? null : true,
        unused   : unused.indexOf(test) === -1 ? null : true,
    };
});

describe('Selectors', function () {

    before(function (done) {
        uncss(rfs('selectors/index.html'), { csspath: 'tests/selectors' }, function (err, output) {
            if (err) {
                throw err;
            }
            rawcss = output;
            done();
        });
    });

    tests.forEach(function (test) {

        if (test.expected) {
            it('Should output expected ' + test.fixture.split('.')[0], function () {
                expect(rawcss).to.include.string(rfs('selectors/expected/' + test.fixture));
            });
        }

        if (test.unused) {
            it('Should not output unused ' + test.fixture.split('.')[0], function () {
                expect(rawcss).to.not.include.string(rfs('selectors/unused/' + test.fixture));
            });
        }
    });

    after(function (done) {
        fs.writeFile(__dirname + '/output/selectors/uncss.css', rawcss, done);
    });
});