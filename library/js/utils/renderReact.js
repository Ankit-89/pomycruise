import _extends from 'babel-runtime/helpers/extends';
import React from 'react';
import { render } from 'react-dom';

var componentData = window.SR.components.data;
var renderedComponents = {};

var isRendered = function isRendered(id) {
    return renderedComponents[id];
};

var renderReact = function renderReact(Component, key) {
    Array.prototype.map.call(
        document && document.querySelectorAll('[data-type="' + key + '"]'),
        function(el) {
            var props = componentData.filter(function(cmp) {
                return cmp.id === el.getAttribute('data-id');
            })[0];

            if (
                props &&
                props.attributes &&
                !isRendered(props.type + '-' + props.id)
            ) {
                var services = props.services || [];
                var type = props.type || '';

                render(
                    React.createElement(
                        Component,
                        _extends({}, props.attributes, {
                            services: services,
                            component: type
                        })
                    ),
                    el
                );

                renderedComponents[props.type + '-' + props.id] = true;
            }
        }
    );
};

export default renderReact;
