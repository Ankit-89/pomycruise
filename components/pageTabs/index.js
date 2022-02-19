import React from 'react';
import TitleH1Mycruise from '../titleH1Mycruise';
import Tabs from '../commons/CUK/tabs';
import HolidayInformation from './holidayInformation';
import EditorialInformation from '../editorialInformation';
import UserDetails from '../userDetails';
import extractChildComponent from '../commons/CUK/extractChildComponent';
import HealthQuestionnaire from '../healthQuestionnaire';
import { checkCookie, getCookie } from '../commons/CUK/cookies';
import { getConfig } from '../commons/CUK/utilities';

class pageTabs extends React.Component {
    constructor(props) {
        super(props);
        const { hash } = typeof window !== 'undefined' && window.location;
        const rearrangedTabs = this.rearrangeTabs(props.tabs);
        const activeTab = rearrangedTabs.findIndex(
            (tab) => tab.type === hash.replace('#', '')
        );
        this.state = {
            activeTab: activeTab >= 0 ? activeTab : 0
        };
    }

    renderTab = (tab, index) => {
        const { services, overlaySelector, childComponents, tabs } = this.props;
        const {
            title,
            type,
            sections,
            description,
            details,
            formFields,
            cta,
            labels,
            loyaltyTiers,
            galleryServlet
        } = tab;
        const accesibilityLabels = tab.accesibilityLabels ? tab.accesibilityLabels : {};
        const { mycruiseSummaryApiV1, toDoListApi } = services.urls;

        const summaryAccordionProps = extractChildComponent(
            childComponents,
            'summaryAccordion'
        );

        const healthQuestionnaireProps = extractChildComponent(
            tabs,
            'healthQuestionnaire'
        );

        const shipsGridProps = extractChildComponent(
            childComponents,
            'shipsGrid'
        );
        const titleH1MycruiseProps = extractChildComponent(
            childComponents,
            'titleH1Mycruise'
        );
        switch (type) {
            case 'healthQuestionnaire':
                return (
                    <HealthQuestionnaire
                        title={title}
                        description={description}
                        key={type}
                        {...healthQuestionnaireProps}
                    />
                );
            case 'holidayInformation':
                return (
                    <HolidayInformation
                        title={title}
                        description={description}
                        details={details}
                        key={type}
                        accesibilityLabels={accesibilityLabels}
                        summaryAccordionProps={summaryAccordionProps.attributes}
                        mediaGalleryServletUrl={galleryServlet}
                        titleH1MycruiseProps={titleH1MycruiseProps.attributes}
                        shipsGridProps={shipsGridProps.attributes}
                        componentName={this.props.component}
                    />
                );
            case 'personalDetails':
                return (
                    <UserDetails
                        title={title}
                        description={description}
                        services={tab.services}
                        toDoListApi={toDoListApi}
                        mycruiseSummaryApiV1={mycruiseSummaryApiV1}
                        labels={labels}
                        accesibilityLabels={accesibilityLabels}
                        loyaltyTiers={loyaltyTiers}
                        formFields={formFields}
                        sections={sections}
                        cta={cta}
                        key={type}
                        componentName={this.props.component}
                    />
                );
            case 'importantToKnow':
                return (
                    <EditorialInformation
                        title={title}
                        description={description}
                        details={details}
                        key={type}
                        overlayLabels={labels}
                        overlaySelector={overlaySelector}
                        componentName={this.props.component}
                        toDoListApi={toDoListApi}
                    />
                );
            default:
                return null;
        }
    };

    rearrangeTabs(tabs) {

        const isCookieExistForHideHQ = checkCookie('hideHQtab');
        const valueOfHideHQ = isCookieExistForHideHQ && getCookie('hideHQtab');
        let valueFromHideHQSwitch = getConfig('hideHQTab') || false;
        if (valueFromHideHQSwitch || (isCookieExistForHideHQ && valueOfHideHQ == 'true')) {
            valueFromHideHQSwitch = true;
        }

        tabs.map((value) => {
            if (value.type === 'personalDetails') {
                value.value = 0;
            }
            if (value.type === 'healthQuestionnaire') {
                value.value = 1;
            }
            if (value.type === 'importantToKnow') {
                value.value = 2;
            }
            if (value.type === 'holidayInformation') {
                value.value = 3;
            }
        });

        let newTabs = tabs;

        if (valueFromHideHQSwitch) {
            newTabs = tabs.filter((value) => {
                if (value.type != 'healthQuestionnaire') {
                    return value;
                }
            });
        }

        newTabs.sort((a, b) => {
            if (a.value > b.value) return 1;
            if (a.value < b.value) return -1;
            return 0;
        })
        return newTabs;
    }

    render() {
        let { title, tabs } = this.props;
        const { activeTab } = this.state;
        tabs = this.rearrangeTabs(tabs);

        return (
            <div>
                <TitleH1Mycruise title={title} type="h1" />
                <div className="content">
                    <Tabs
                        selected={activeTab}
                        componentName={this.props.component}
                    >
                        {tabs.map(this.renderTab)}
                    </Tabs>
                </div>
            </div>
        );
    }
}

export default pageTabs;
