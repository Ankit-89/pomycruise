'use strict';

import React from 'react';
import Tabs from '../commons/CUK/tabs';
import Image from '../commons/CUK/image';

class tabsMycruise extends React.Component {
    constructor(props) {
        super(props);
    }

    renderTab = (item, i) => {
        const { title, image, description, name } = item;
        return (
            <div className="image-copy-block" title={title} key={i}>
                <div className="tile-holder">
                    <div className="tileGrid image-holder">
                        {image && <Image {...image} />}
                    </div>
                    <div className="tileGrid content">
                        <div className="spacing-container left text-left">
                            <div className="title">
                                <h3 className="h2 heading" dangerouslySetInnerHTML={{
                                        __html: name
                                    }}></h3>
                            </div>
                            <div className="text-holder description-block">
                                {description}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    render() {
        const { tabs } = this.props;
        return (
            tabs.length > 0 && (
                <Tabs
                    selected={0}
                    role="tabpanel"
                    componentName={this.props.component}
                >
                    {tabs.map(this.renderTab)}
                </Tabs>
            )
        );
    }
}

export default tabsMycruise;
