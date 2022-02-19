(function (exports) {
'use strict';

var MediaAnalytics = function (_akamai$amp$Plugin) {
  babelHelpers.inherits(MediaAnalytics, _akamai$amp$Plugin);
  babelHelpers.createClass(MediaAnalytics, null, [{
    key: "create",
    value: function create(player, config) {
      var _this2 = this;

      window.AKAMAI_MEDIA_ANALYTICS_CONFIG_FILE_PATH = config.config;
      return akamai.amp.AMP.addResources(config.sdk).then(function () {
        return babelHelpers.get(MediaAnalytics.__proto__ || Object.getPrototypeOf(MediaAnalytics), "create", _this2).call(_this2, player, config);
      });
    }
  }]);

  function MediaAnalytics(player, config) {
    babelHelpers.classCallCheck(this, MediaAnalytics);
    return babelHelpers.possibleConstructorReturn(this, (MediaAnalytics.__proto__ || Object.getPrototypeOf(MediaAnalytics)).call(this, player, config));
  }

  babelHelpers.createClass(MediaAnalytics, [{
    key: "setDimensions",
    value: function setDimensions(value) {
      var dimensions = this.config.dimensions;
      for (var key in value) {
        var val = value[key];
        if (val != null) {
          dimensions[key] = val; // TODO: Does this need to be evaluated for bindings?
        }
      }
      this.applyDimensions(dimensions);
      return value;
    }
  }, {
    key: "applyDimensions",
    value: function applyDimensions(dimensions) {
      if (typeof window.setAkamaiMediaAnalyticsData != "function") return;

      try {
        for (var key in dimensions) {
          setAkamaiMediaAnalyticsData(key, dimensions[key]);
        }
      } catch (error) {
        this.player.logger.error("[AMP MEDIA ANALYTICS ERROR]", "Could not set dimensions:", error);
      }

      if (this.config.iplookup === false && typeof akamaiDisableServerIpLookup === "function") {
        akamaiDisableServerIpLookup();
      }
    }
  }, {
    key: "onready",
    value: function onready(event) {
      try {
        if (this.debug === true) {
          window.AkamaiAnalytics_debug = 1;
        }
        window.akamaiSetVideoObject(this.player.mediaElement);
      } catch (error) {
        this.player.logger.error("[AMP MEDIA ANALYTICS ERROR]", "Could not set video tag", error);
      }

      var ads = this.player.ads;
      if (ads == null) return;

      ads.addEventListener("breakstart", this.onadbreakstart.bind(this));
      ads.addEventListener("breakend", this.onadbreakend.bind(this));
      ads.addEventListener("loaded", this.onadloaded.bind(this));
      ads.addEventListener("started", this.onadstarted.bind(this));
      ads.addEventListener("ended", this.onadended.bind(this));

      ads.addEventListener("firstquartile", this.onadfirstquartile.bind(this));
      ads.addEventListener("midpoint", this.onadmidpoint.bind(this));
      ads.addEventListener("thirdquartile", this.onadthirdquartile.bind(this));
    }
  }, {
    key: "onmediachange",
    value: function onmediachange(event) {
      var media = event.detail;
      var dimensions = null;

      if (typeof akamaiSetStreamURL === "function") {
        akamaiSetStreamURL(media.src, false);
      }

      var viewerId = this.config.viewerId || this.config.viewerID || this.config["std:viewerId"];
      if (viewerId != null && typeof akamaiSetViewerId == "function") {
        akamaiSetViewerId(viewerId);
      }

      var config = media.mediaanalytics;
      if (config != null && config.dimensions != null) {
        dimensions = akamia.amp.Utils.override(this.config.dimensions, config.dimensions);
      } else {
        dimensions = this.config.dimensions;
      }

      if (typeof akamaiHandleStreamSwitch === "function") {
        akamaiHandleStreamSwitch();
      }

      this.applyDimensions(dimensions);
    }
  }, {
    key: "updateMedia",
    value: function updateMedia(media) {
      if (typeof akamaiHandleTitleSwitch === "function") {
        akamaiHandleTitleSwitch(media);
      }
    }
  }, {
    key: "onfragmentloadstart",
    value: function onfragmentloadstart(event) {
      if (typeof fragmentDownloadStarted === "function") {
        fragmentDownloadStarted(event.detail);
      }
    }
  }, {
    key: "onfragmentloaded",
    value: function onfragmentloaded(event) {
      if (typeof fragmentDownloadCompleted === "function") {
        fragmentDownloadCompleted(event.detail);
      }
    }
  }, {
    key: "onbitratechange",
    value: function onbitratechange(event) {
      if (typeof akamaiHandleBitRateSwitch === "function") {
        akamaiHandleBitRateSwitch(event.detail.bitrate);
      }
    }
  }, {
    key: "onadbreakstart",
    value: function onadbreakstart() {
      this.player.mediaElement.dataset.isad = true;
    }
  }, {
    key: "onadbreakend",
    value: function onadbreakend() {
      this.player.mediaElement.dataset.isad = false;
    }
  }, {
    key: "onadloaded",
    value: function onadloaded(event) {
      try {
        var adVO = event.data;
        var adObject = {
          adDuration: adVO.duration,
          adPartnerId: adVO.partner,
          adTitle: adVO.title,
          adId: adVO.id
        };

        if (typeof akamaiHandleAdLoaded === "function") {
          akamaiHandleAdLoaded(adObject);
        }
      } catch (error) {
        this.player.logger.error("[AMP MEDIA ANALYTICS ERROR]", error);
      }
    }
  }, {
    key: "onadstarted",
    value: function onadstarted() {
      if (typeof akamaiHandleAdStarted === "function") {
        akamaiHandleAdStarted();
      }
    }
  }, {
    key: "onadfirstquartile",
    value: function onadfirstquartile() {
      if (typeof akamaiHandleAdFirstQuartile === "function") {
        akamaiHandleAdFirstQuartile();
      }
    }
  }, {
    key: "onadmidpoint",
    value: function onadmidpoint() {
      if (typeof akamaiHandleAdMidpoint === "function") {
        akamaiHandleAdMidpoint();
      }
    }
  }, {
    key: "onadthirdquartile",
    value: function onadthirdquartile() {
      if (typeof akamaiHandleAdThirdQuartile === "function") {
        akamaiHandleAdThirdQuartile();
      }
    }
  }, {
    key: "onadended",
    value: function onadended() {
      if (typeof akamaiHandleAdCompleted === "function") {
        akamaiHandleAdCompleted();
      }
      // TODO: Why is this here?
      this.player.getMediaElement().dataset.isad = true;
    }
  }]);
  return MediaAnalytics;
}(akamai.amp.Plugin);

akamai.amp.AMP.registerPlugin("mediaanalytics", MediaAnalytics.factory);

exports.MediaAnalytics = MediaAnalytics;

}((this.akamai.amp.mediaanalytics = this.akamai.amp.mediaanalytics || {})));
//# sourceMappingURL=Mediaanalytics.js.map
