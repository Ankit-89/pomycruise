import React from 'react';
import PropTypes from 'prop-types';

const outputComponent = ({ Component, properties }, i) => {
    const { attributes, services, type } = properties;

    return (
        <div className={`react-component ${type}`} key={`comp-${i}`}>
            <Component {...attributes} services={services} component={type} />
        </div>
    );
};

outputComponent.propTypes = {
    Component: PropTypes.element.isRequired,
    properties: PropTypes.object.isRequired
};

const page = ({ headComponents, bodyComponents }) => (
    <div className="wrapper">
        {headComponents && (
            <div className="alert-header-wrapper">
                {headComponents.map(outputComponent)}
            </div>
        )}
        {bodyComponents.map(outputComponent)}
    </div>
);

page.propTypes = {
    headComponents: PropTypes.array,
    bodyComponents: PropTypes.array.isRequired
};

export default page;
