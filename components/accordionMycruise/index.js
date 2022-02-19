import React from 'react';
import TitleH1Mycruise from '../titleH1Mycruise';
import analytics from '../commons/CUK/analytics';
import videoplayer from '../commons/CUK/videoplayer';

class accordionMycruise extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            openRowIndex: -1
        };
    }

    componentDidMount() {
        // analytics.clickTracking(this);
    }

    componentDidUpdate() {
        // analytics.clickTracking(this);
    }

    openAccordion(e, index) {
        analytics.clickTracking(this);
        e.preventDefault();
        this.setState((prevState) => ({
            openRowIndex: prevState.openRowIndex === index ? -1 : index
        }));
    }

    renderQuestion = (questionBlock, index) => {
        const { labels } = this.props;
        const { openRowIndex } = this.state;
        const { questionLabel, answerLabel } = labels;
        const { question, answer, video } = questionBlock;
        const isVisible = openRowIndex === index ? 'visible' : '';
        const dummy = "";
        const videojson = {"source": [{"src": video}]};
        return (
            <li key={index} className={`qa__item ${isVisible}`}>
                <a
                    href="#"
                    className="qa__open"
                    data-linktext={question}
                    aria-expanded={openRowIndex === index ? 'true' : 'false'}
                    aria-controls={`panel-${index}`}
                    data-componentname={this.props.type}
                    onClick={(e) => {
                        this.openAccordion(e, index);
                    }}
                >
                    <span className="qa__letter">{questionLabel}</span>
                    <h5>{question}</h5>
                </a>
                <div
                    tabIndex="0"
                    className="qa__body"
                    aria-hidden={openRowIndex === index ? 'false' : 'true'}
                    aria-labelledby={`control-panel-${index}`}
                >
                    <span className="qa__letter">{answerLabel}</span>
                    {/* <p className="qa__answer" >
                        {answer}
                    </p> */}
                    <div
                        className="qa__answer"
                        dangerouslySetInnerHTML={{
                            __html: answer
                        }}
                    />

                        <div
                        className="video-container"
                        data-linktext={`${dummy}:${
                            dummy
                        }:${dummy}:play`}
                        aria-label={dummy}
                    >
                        <videoplayer
                            video={videojson}
                           /* autoplay={videoAutoplay}
                            componentMountCallback={videoMountCallback}*/
                        />
                    </div>
                </div>
            </li>
        );
    };

    render() {
        const { questions, title } = this.props;
        const titleH1Props = {
            title,
            description: '',
            type: 'h2'
        };

        return (
            <div>
                {titleH1Props.title && <TitleH1Mycruise {...titleH1Props} />}
                <ul className="qa">{questions.length > 0 && questions.map(this.renderQuestion)}</ul>
            </div>
        );
    }
}

export default accordionMycruise;
