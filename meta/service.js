'use strict';

const fs      = require('fs');
const path    = require('path');
const request = require('request');

module.exports = class MetaService {
  static dispatch(set) {
    var set    = set.split(/#|:/).slice(-2);
    var module = set.first(), action = set.last();

    if (module == 'soundcloud')
      SoundCloudService[action].call();
    else if (module == 'youtube')
      YouTubeService[action].call();
    else if (module == 'local')
      LocalService[action].call();
    else
      MetaService[action].call();
  }

  static search(value, source, modules) {
    return Promise.resolve({}).then((hash) => {
      if (modules.includes('soundcloud'))
        return SoundCloudService.search(value, source).then((results) => {
          hash.soundcloud = results;

          return hash;
        });

      return hash;
    }).then((hash) => {
      if (modules.includes('youtube'))
        return YouTubeService.search(value, source).then((results) => {
          hash.youtube = results;

          return hash;
        });

      return hash;
    }).then((hash) => {
        if (modules.includes('local'))
          return LocalService.search(value).then((results) => {
            hash.local = results;

            Cache.search_results = hash;

            return hash;
          });
        else
          Cache.search_results = hash;

        return hash;
    });
  }

  static downloadImage(url, artist, title, callback) {
    var location = Formatter.cover_path(url, artist, title);

    this.download(url, location, false, () => {
      callback(location);
    });
  }

  static download(url, location, id, callback) {
    request.head(url, (err, res, body) => {
      var req = request(url);
      var size, remaining;

      req.pipe(fs.createWriteStream(location));

      if (id) {
        req.on('response', (response) => {
          size      = response.headers['content-length'];
          remaining = size;

          Downloads.grow(size);
        });

        req.on('data', (chunck) => {
          remaining = remaining - chunck.length;

          Downloads.progress(chunck.length);
          Ui.downloadProgress(id, (size - remaining) / size * 100);
        });
      }

      req.on('end', () => {
        callback();
      });
    });
  }
}
