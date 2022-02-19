/* global akamai */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

class videoplayer extends React.PureComponent {
    constructor(props) {
        super(props);
        this.renderVideo = false;
    }

    componentWillMount() {
        // Null Check for Video source
        // console.log('Video player', this.props.video);
        if (this.props.video.source.length && this.props.video.source[0].src) {
            this.renderVideo = true;
        }
    }

    componentDidMount() {
        if (!this.renderVideo) {
            return;
        }

        const jsVideoPlayer = window.configs.jsLibsPath
            ? `${window.configs.jsLibsPath}vendor/videoPlayer/`
            : '/library/js/vendor/videoPlayer/';

        const audiodescriptions = {
            resources: [
                {
                    src: `${jsVideoPlayer}akamai/amp/audiodescriptions/Audiodescriptions.js`,
                    type: 'text/javascript'
                },
                {
                    src: `${jsVideoPlayer}akamai/amp/audiodescriptions/Audiodescriptions.css`,
                    type: 'text/css'
                }
            ]
        };

        var config = {
            media: this.props.video,
            autoplay: this.props.autoplay,
            muted: this.props.muted,
            loop: this.props.loop,
            playsinline: this.props.playsInline,
            captioning: {},
            playoverlay: { enabled: false },
            titlebar: { enabled: false },
            paths: {
                player: `${jsVideoPlayer}amp/`,
                resources: `${jsVideoPlayer}resources/`
            },
            mode: 'html-auto',
            flash: {
                resources: [
                    {
                        id: 'AkamaiAdvancedStreamingPlugin',
                        enable: false
                    }
                ]
            },
            resources: [],
            plugins: {
                react: {
                    resources: [
                        {
                            src: `${jsVideoPlayer}akamai/amp/react/React.min.css`,
                            debug: `${jsVideoPlayer}akamai/amp/react/React.css`,
                            type: 'text/css'
                        },
                        {
                            src: `${jsVideoPlayer}akamai/amp/react/React.min.css`,
                            debug: `${jsVideoPlayer}akamai/amp/react/React.css`,
                            type: 'text/css'
                        },
                        {
                            src: `${jsVideoPlayer}akamai/amp/react/React.min.css`,
                            debug: `${jsVideoPlayer}akamai/amp/react/React.css`,
                            type: 'text/css'
                        },
                        {
                            src: `${jsVideoPlayer}akamai/amp/react/React.min.js`,
                            debug: `${jsVideoPlayer}akamai/amp/react/React.js`,
                            type: 'text/javascript'
                        },
                        {
                            src: `${jsVideoPlayer}akamai/amp/react/React.min.css`,
                            debug: `${jsVideoPlayer}akamai/amp/react/React.css`,
                            type: 'text/css'
                        }
                    ]
                }
            }
        };

        if (window && window.configs && window.configs.enableAudioDescription) {
            config.plugins.audiodescriptions = audiodescriptions;
        }

        if (this.props.isBackground) {
            config.controls = { mode: 'none' };
            config.media.track = null;
        }

        let amp = ReactDOM.findDOMNode(this).amp;

        if (typeof akamai !== 'undefined' && typeof amp !== 'object') {
            window.React = React;
            window.ReactDOM = ReactDOM;
            window.PropTypes = PropTypes;
            akamai.amp.AMP.create(ReactDOM.findDOMNode(this), config);
        }

        if (this.props.isBackground) {
            if (typeof amp === 'object') {
                amp.addEventListener('canplay', function() {
                    if (!amp.getVolume()) return false;
                    amp.setVolume(0);
                });
            }
        }

        if (this.props.componentMountCallback)
            this.props.componentMountCallback(this.videoRef.amp);
    }

    componentWillUnmount() {
        if (this.videoRef && this.videoRef.amp) {
            try {
                this.videoRef.amp.destroy();
            } catch (e) {
                // console.log(e.message);
            }
        }
    }

    render() {
        let ampVideoClass = 'amp-video-container';

        if (this.props.isBackground) {
            ampVideoClass += ' akamai-background-video amp-controls-none';
        }

        if (this.props.showOnlyPlayButton) {
            ampVideoClass += ' akamai-only-play-button';
        }

        let videoHtml = null;

        if (this.renderVideo) {
            // Render video only when it has a valid url
            videoHtml = (
                <div
                    className={`${ampVideoClass}`}
                    ref={(elem) => {
                        this.videoRef = elem;
                    }}
                />
            );
        }

        return videoHtml;
    }
}

videoplayer.propTypes = {
    autoplay: PropTypes.bool,
    componentMountCallback: PropTypes.func,
    video: PropTypes.shape({
        source: PropTypes.arrayOf(
            PropTypes.shape({
                src: PropTypes.string,
                type: PropTypes.string
            })
        ).isRequired,
        poster: PropTypes.string,
        title: PropTypes.string,
        track: PropTypes.arrayOf(
            PropTypes.shape({
                kind: PropTypes.string,
                type: PropTypes.string,
                srclang: PropTypes.string,
                src: PropTypes.string
            })
        )
    }).isRequired
};

videoplayer.defaultProps = {
    autoplay: false,
    muted: false,
    loop: false,
    playsInline: false,
    isBackground: false,
    showOnlyPlayButton: false
};

export default videoplayer;
