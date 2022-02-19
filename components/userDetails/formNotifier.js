import React from 'react';

const formNotifier = ({
    complete = false,
    incompleteLabel = '',
    completeLabel = ''
}) => (
    <div
        className={`form_notification ${
            complete ? 'form-complete' : 'form-incomplete'
        } `}
    >
        <span className="notification-icon" />
        <span className="notification-text">
            {complete ? completeLabel : incompleteLabel}
        </span>
    </div>
);

export default formNotifier;
