import React from 'react';
import Link from '../link';

const checkForLink = (props) => {
    const { clickable, children, linkProps = {}, linkClassName = '' } = props;

    if (clickable) {
        return (
            <Link {...linkProps} linkClassName={linkClassName}>
                {children}
            </Link>
        );
    } else {
        return <div className={linkClassName}>{children}</div>;
    }
};

export default checkForLink;
