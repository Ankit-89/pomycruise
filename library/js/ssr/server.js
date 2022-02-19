/* eslint-disable new-cap */
/* eslint-disable no-undef */
import './polyfill';
import { createFactory } from 'react';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';

import * as server from '@carnival-abg/po-postbooking';

var renderReact = function renderReact(props) {
    props = JSON.parse(props);

    var Component = createFactory(server[props.type]);
    var fn = props.meta.render === 'serverside' ? renderToStaticMarkup : renderToString;

    return fn(Component(props.attributes));
};

export default server;
export { renderReact };
