// use babel to extract
const babel = require('babel-core');
const JSPath = require('jspath');
const fs = require('fs');
const debug = require('debug')('extract-component-data');

module.exports = (templateName, brand = 'po') => {
    let scriptsAST;
    debug("extra templateName", templateName);
    try {
        scriptsAST = babel.transformFileSync(
            `./library/js/mediators/${templateName}.js`
        );
    } catch (e) {
        debug(`Unable to parse mediator ${templateName}`, e);

        throw new Error('parseError');
    }
    // debug("extra scriptsAST", scriptsAST);

    // find all Object Expressions inside of the _COMPONENTS variable
    const componentsData = JSPath.apply(
        '..{.type==="VariableDeclarator" && .id{.name==="_COMPONENTS" }}.init.properties..{.type==="ObjectExpression"}',
        scriptsAST
    );
    debug("extra componentsData", componentsData);
    let data = componentsData.map(component => {
        const id = JSPath.apply(
            '..{.type==="ObjectProperty" && .key.name ==="id"}.value.value',
            component
        )[0];
        const dataId = JSPath.apply(
            '..{.type==="ObjectProperty" && .key.name ==="dataId"}.value.value',
            component
        )[0];
        debug("extra data", id, dataId);
        return { id, dataId };
    });
    debug("brand", brand);
    data = data.map(({ id, dataId = brand }) => {
        try {
            debug(id,dataId);
            return Object.assign(
                {},
                JSON.parse(
                    fs.readFileSync(
                        require.resolve(
                            `./components/${id}/data/${dataId}.json`
                        )
                    )
                ),
                { type: id, id: dataId }
            );
        } catch (e) {
            debug(`Unable to find data for ${id} ${dataId}`, e);
            return { type: id, id: dataId };
        }
    });

    return data;
};
