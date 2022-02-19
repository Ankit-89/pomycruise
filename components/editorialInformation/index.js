import React from 'react';
import EditorialTile from '../editorialTile';
import ArticleOverlay from '../articleOverlay';
import analytics from '../commons/CUK/analytics';
import SessionStorage from '../commons/CUK/session-storage';
import { updateToDoList, getConfig } from '../commons/CUK/utilities';

class editorialInformation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            overlayHeader: false
        };
    }

    renderDetail = ({ title, description, cta, image, articleType }, index) => (
        <EditorialTile
            key={index}
            classes="tile"
            title={title}
            description={description}
            articleType={articleType}
            link={cta}
            image={image}
            clickAction={this.handleOverlay}
        />
    );

    handleOverlay = (bool, url, articleType) => {
        const { toDoListApi } = this.props;
        const userData = SessionStorage.getItem('userData');
        const { paxNumber } = userData.customer;        
        const shipCode = getConfig('shipCode', ''); // CK - for placing shipCode AC in url
        const contentUrl = url ? url.replace("/mycruise", `/mycruise/${shipCode}`) : url;
        this.setState(
            () => ({
                showModal: bool,
                overlayData: contentUrl || '' //CK
            }),
            () => {
                if (bool && articleType && articleType === 'vaccination') {
                    updateToDoList(toDoListApi, 'vaccinationCheck', paxNumber);
                } else if (bool && articleType && articleType === 'passport') {
                    updateToDoList(toDoListApi, 'visaInfoCheck', paxNumber);
                }
                var analyticsParams = {
                    contentName: contentUrl //CK
                };

                analytics.overlayLoad('screenLoad', analyticsParams);
            }
        );
    };

    render() {
        const {
            details,
            description,
            overlayLabels,
            overlaySelector
        } = this.props;
        const { showModal, overlayData } = this.state;

        return (
            details && (
                <div className="editorialInformation">
                    <p className="content-description">{description}</p>
                    <div className="tiles-container">
                        <div className="tiles-list">
                            {details.map(this.renderDetail)}
                        </div>
                    </div>
                    <ArticleOverlay
                        mounted={showModal}
                        onExit={() => this.handleOverlay(false)}
                        underlayClass="article--overlay"
                        serviceUrl={overlayData}
                        labels={overlayLabels}
                        overlaySelector={overlaySelector}
                    />
                </div>
            )
        );
    }
}

export default editorialInformation;
