'use strict';

require('../app/core_ext');

// Stub the local storage for testing purpose.
global.localStorage = {
  internal_hash: {},
  getItem: function(key) {
    return this.internal_hash[key];
  },
  setItem: function(key, value) {
    this.internal_hash[key] = value;
  },
  clear: function() {
    this.internal_hash = {};
  }
};

global.assert     = require('assert');
global.fs         = require('fs');
global.path       = require('path');
global.Handlebars = require('handlebars');

global.Config      = require('../app/config');
global.Cache       = require('../app/cache');
global.Html        = require('../app/html');
global.Formatter   = require('../app/formatter');
global.Paths       = require('../app/paths');
global.Translation = require('../app/translation');

global.MetaModel = require('../meta/model');

// Add the `assert.include` helper
assert.include = function(str, sub_string) {
  if (str instanceof Handlebars.SafeString)
    str = str.string;

  var message = `Expected \`${sub_string}\` to be included in:\n${str}`;

  assert(str.includes(sub_string), message);
};

// Add the `assert.exclude` helper
assert.exclude = function(str, sub_string) {
  if (str instanceof Handlebars.SafeString)
    str = str.string;

  var message = `Expected \`${sub_string}\` *not* to be in:\n${str}`;

  assert(!str.includes(sub_string), message);
};

global.keys = (object, scope, array) => {
  if (!scope) {
    scope = "";
    array = [];
  }

  for (var key in object) {
    if (typeof object[key] == 'object')
      keys(object[key], scope + "." + key, array);
    else
      array.push(scope + "." + key);
  }

  return array;
}
