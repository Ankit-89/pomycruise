import React from 'react';
import Player from '../commons/CUK/videoplayer';

const singleVideo = ({ video }) => (
    <div className="article--video">
        <Player
            video={video}
            autoplay={false}
            muted={false}
            loop={false}
            playsInline={true}
            isBackground={false}
        />
    </div>
);

export default singleVideo;
