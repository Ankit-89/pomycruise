import React from 'react';
import Tabs from '../commons/CUK/tabs';
import Image from '../commons/CUK/image';
import Title from '../titleH1Mycruise';

class tabsImage extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {}
    render() {
        const titleH1Props = {
            title: this.props.title,
            description: this.props.description,
            type: 'h1',
            showIcon: true
        };
        const { tabs } = this.props;

        return (
            <div className="">
                {titleH1Props.title && <Title {...titleH1Props} />}
                <Tabs
                    selected={0}
                    hasThumb={true}
                    componentName={this.props.component}
                >
                    {tabs.map((item, i) => {
                        return (
                            <div
                                className="image-copy-block"
                                title={item.shortTitle}
                                thumb={item.thumbImage}
                                key={i}
                            >
                                <div className="tile-holder">
                                    <div className="tileGrid image-holder">
                                        {item.image && (
                                            <Image {...item.image} />
                                        )}
                                    </div>
                                    <div className="tileGrid content">
                                        <div className="spacing-container left text-left">
                                            <div className="title">
                                                <h3 className="h2 heading" dangerouslySetInnerHTML={{ __html: item.longTitle }}>
                                                </h3>
                                            </div>
                                            <div className="text-holder description-block">
                                                {item.description}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </Tabs>
            </div>
        );
    }
}

export default tabsImage;
