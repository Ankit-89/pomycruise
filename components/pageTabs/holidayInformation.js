import React from 'react';
import SummaryAccordion from '../summaryAccordion';
import MediaGalleryVideoServlet from '../mediaGalleryVideoServlet';
import ShipsGrid from '../shipsGrid';
import TitleH1Mycruise from '../titleH1Mycruise';

class holidayInformation extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            summaryAccordionProps,
            mediaGalleryServletUrl,
            titleH1MycruiseProps,
            shipsGridProps
        } = this.props;
        const accesibilityLabels = this.props.accesibilityLabels ? this.props.accesibilityLabels : {};
        return (
            <div className="holidayInformation">
                <SummaryAccordion {...summaryAccordionProps} />
                <MediaGalleryVideoServlet
                    mediaGalleryServletUrl={mediaGalleryServletUrl}
                    accesibilityLabels={accesibilityLabels}
                />
                <TitleH1Mycruise {...titleH1MycruiseProps} />
                <ShipsGrid {...shipsGridProps} />
            </div>
        );
    }
}

export default holidayInformation;
