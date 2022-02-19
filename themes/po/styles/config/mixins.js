module.exports = {
    mixins: {
        border( mixin, width = '1px', style = 'solid', color = 'blue' ) {

            return {
                'border-width': width,
                'border-style': style,
                'border-color': color
            };
        },
        test( mixin, str ) {

            return {
                content: str
            };
        }
    }
};