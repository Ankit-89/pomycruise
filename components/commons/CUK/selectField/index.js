/**
 *
 * Common Utility Module to handle selectField across the components
 *
 * @module SelectField
 *
 */
 import React from 'react';
 import PropTypes from 'prop-types';
 
 class selectField extends React.Component {
     /**
      * constructor
      * @param {React-props} props - Props passed to this module
      */
     constructor(props) {
         super(props);
 
         if (
             typeof props.defaultValue === 'undefined' &&
             Object.keys(this.props.options[0]).length === 1
         ) {
             this.selectedValue = Object.keys(props.options[0])[0];
 
             this.selectedLabel = this.props.title;
         } else {
             this.setDefaultValues();
         }
 
         this.state = {
             showError: false,
             dropdownShow: false,
             valueChanged: false,
             errorMsg: this.props.errorMsg ? this.props.errorMsg.empty : null,
             options: this.props.options
         };
         this.setDefaultValues = this.setDefaultValues.bind(this);
         this.errorCallback = this.errorCallback.bind(this);
         this.isValidatorDisabled = this.isValidatorDisabled.bind(this);
         this.handleChange = this.handleChange.bind(this);
         // this.blurCallBack = this.blurCallBack.bind(this);
 
         //this.dropdownList = this.getDropdownValues();
 
         this.classList = {
             getClassNameToShowError: (showError) => {
                 return showError ? 'show-error' : '';
             },
             getClassNameToShowDropdown: (showDropdown) => {
                 return showDropdown ? 'show' : '';
             }
         };
     }
 
     setDefaultValues = () => {
         const { options = [], title } = this.props;
         let option =
             options.filter((option) => {
                 // Unfortunately, you have to compare the title to the label in the options to determine a match
                 return option.label === title;
             })[0] || options[0];
 
         this.selectedValue =
             typeof this.props.defaultLabel !== 'undefined'
                 ? this.props.defaultLabel
                 : option.value;
 
         this.selectedLabel = title;
     };
 
     /**
      * componentWillReceiveProps
      * @param {React-props} nextProps - new props received by module
      */
     componentWillReceiveProps(nextProps) {
         if (
             nextProps.validate === true &&
             this.props.validate !== nextProps.validate
         ) {
             this.validate();
         }
         if (nextProps.options !== this.state.options) {
             this.setState(
                 {
                     options: nextProps.options
                 },
                 () => {
                     // this.dropdownList = this.getDropdownValues();
                 }
             );
         }
     }
     /**
      * errorCallback
      * @param {boolean} errorState - based on erroState display/hide error message
      * @param {string}  errorMsg - error message to display for selectField
      */
     errorCallback(errorState, errorMsg) {
         this.setState({
             showError: errorState
         });
 
         if (this.props.errorCallback) {
             this.props.errorCallback(errorState, errorMsg);
         }
     }
 
     isValidatorDisabled = () => {
         return this.props.disableValidation;
     };
 
     /**
      * handleChange
      * @param {function}  callback - callback to execute
      * @param {bool}  valueChanged - true if call resulted in changed value.
      * If no value was given then it remains the same
      * @param {object}  event - Select feild change object
      */
     handleChange = (
         callback,
         valueChanged = this.state.valueChanged,
         event
     ) => {
         const { name } = this.props;
 
         if (event != undefined && event.target.selectedIndex >= 0) {
             let dataset =
                 event.target.options[event.target.selectedIndex].dataset;
             // .dataset is not supported on IE <= 10, so if dataset is undefined, fallback
 
             this.selectedValue = dataset
                 ? dataset.label
                 : event.target.options[event.target.selectedIndex].getAttribute(
                       'data-label'
                   );
 
             this.selectedLabel = event.target.value;
             this.validate();
 
             callback(name, this.selectedValue, this.selectedLabel, event);
             this.setState({ valueChanged });
         }
     };
 
     /**
      * validate - validate selected option if it is default option or empty
      */
 
     validate = () => {
         const {
             defaultValue: invalidValue,
             errorMsg = { empty: '' }
         } = this.props;
         let error =
             this.selectedLabel === invalidValue ||
             this.selectedValue === invalidValue ||
             this.selectedValue === undefined;
 
         if (!this.isValidatorDisabled()) {
             this.errorCallback(error, errorMsg.empty);
         }
     };
 
     /**
      * getDropdownValues - generates options for selectField
      */
 
     getDropdownValues = () => {
         const isCountryDropDown = this.props.name === 'country' ? true : false;
         const isComponentCallFromYouthReg =
             this.props.componentCallFrom &&
             this.props.componentCallFrom == 'youthReg'
                 ? true
                 : false;
 
         return (
             this.state.options &&
             this.state.options.map((item, index) => {
                 let disabled = item.disabled ? true : false;
 
                 if (Object.keys(item).length === 1) {
                     for (let i in item) {
                         if (isCountryDropDown) {
                             return (
                                 <option
                                     className="dropdown-item"
                                     key={i}
                                     disabled={disabled}
                                     data-label={i}
                                     data-isoCode={item[i].isoCode}
                                     data-reference={`container${i}`}
                                     onMouseEnter={(e) => {
                                         e.preventDefault();
                                         this.handlehover(e);
                                     }}
                                 >
                                     {item[i].label}
                                 </option>
                             );
                         } else {
                             return (
                                 <option
                                     className="dropdown-item"
                                     key={i}
                                     disabled={disabled}
                                     data-label={i}
                                     data-reference={`container${i}`}
                                     onMouseEnter={(e) => {
                                         e.preventDefault();
                                         this.handlehover(e);
                                     }}
                                 >
                                     {!isComponentCallFromYouthReg
                                         ? item[i].label
                                         : this.renderLabel(item[i])}
                                 </option>
                             );
                         }
                     }
                 } else {
                     return (
                         <option
                             className="dropdown-item"
                             disabled={disabled}
                             key={index}
                             data-label={item.value}
                             data-reference={`container${index}`}
                         >
                             {!isComponentCallFromYouthReg
                                 ? item.label
                                 : this.renderLabel(item)}
                         </option>
                     );
                 }
             })
         );
     };
 
     renderLabel = (item) => {
         if (item.registered) {
             return (
                 <div>
                     <span
                         className="labelValue"
                         style={{ marginRight: '30px' }}
                     >
                         {item.label}
                     </span>
                     <span className="labelRegisteredValue">
                         {item.registered ? 'REGISTERED' : 'UN-REGISTERED'}
                     </span>
                 </div>
             );
         } else {
             return <span className="labelValue">{item.label}</span>;
         }
     };
 
     getClassForSelectGroupElement = () => {
         const {
             classList: { getClassNameToShowError, getClassNameToShowDropdown },
             state: { dropdownShow },
             props: { selectClassName, activateErrorState }
         } = this;
 
         let showError = this.props.additionalError
             ? this.props.additionalError
             : this.state.showError;
         const baseClass = 'select-group input-container';
 
         return `${baseClass} ${getClassNameToShowError(
             showError || activateErrorState
         )} ${selectClassName} ${getClassNameToShowDropdown(dropdownShow)}`;
     };
 
     shouldShowLabel = () => {
         const { defaultValue } = this.props;
 
         return !!this.selectedValue && this.selectedValue !== defaultValue;
     };
 
     getLabelClass = () => {
         const { showLabel } = this.props;
         const labelClass =
             showLabel && this.shouldShowLabel() ? 'show' : 'sr-only';
 
         return `input-label ${labelClass}`;
     };
     /**
      * Gives markup for selectField
      * @returns {React-markup} - Returns React markup to generate selectField
      */
     render() {
         const {
             props: {
                 name = '',
                 label = '',
                 showLabel,
                 readOnly,
                 title,
                 isMandatory,
                 disableDefaultOption,
                 ariaRequired,
                 ariaLabel,
                 selectClassName,
                 changeCallback = () => {},
                 blurCallBack = () => {}
             }
         } = this;
 
         let showError = this.props.additionalError
             ? this.props.additionalError
             : this.state.showError;
 
         if (!readOnly) {
             return (
                 <div className={this.getClassForSelectGroupElement()}>
                     <label
                         htmlFor={name}
                         id={`${name}-dd-label`}
                         className={this.getLabelClass()}
                     >
                         {typeof ariaLabel !== 'undefined' ? ariaLabel : label}
                     </label>
                     <select
                         className="dropdown-list"
                         value={title ? title : label}
                         id={name}
                         name={name}
                         aria-labelledby={`${name}-dd-label`}
                         aria-describedBy={`${name}_err`}
                         ref="dropdownContainer"
                         aria-invalid={showError}
                         aria-required={ariaRequired ? ariaRequired : false}
                         onChange={this.handleChange.bind(
                             this,
                             changeCallback,
                             true
                         )}
                         onBlur={this.handleChange.bind(
                             this,
                             blurCallBack,
                             undefined
                         )}
                     >
                         {!disableDefaultOption && (
                             <option
                                 selected={isMandatory}
                                 disabled={isMandatory}
                                 hidden={isMandatory}
                             >
                                 {label}
                             </option>
                         )}
                         {this.getDropdownValues()}
                     </select>
                     {showError ? (
                         <p id={`${name}_err`} className={`error-msg show-msg`} role="alert">
                             {this.state.errorMsg}
                         </p>
                     ) : null}
                 </div>
             );
         } else {
             return (
                 <div
                     className={`common-input-group input-group ${selectClassName} ${
                         readOnly ? 'read-only' : ''
                     }`}
                 >
                     <label
                         htmlFor={name}
                         className={`input-label ${
                             showLabel ? 'show' : 'sr-only'
                         }`}
                     >
                         {label}
                     </label>
                     <div className="input-error-wrapper">
                         <input
                             className="input-field"
                             name={name}
                             type="text"
                             value={title ? title : label}
                             readOnly={readOnly}
                         />
                     </div>
                 </div>
             );
         }
     }
 }
 
 export default selectField;
 
 selectField.propTypes = {
     defaultValue: PropTypes.string,
     name: PropTypes.string.isRequired,
     label: PropTypes.string.isRequired,
     changeCallback: PropTypes.func.isRequired,
     showLabel: PropTypes.bool,
     readOnly: PropTypes.bool,
     title: PropTypes.string,
     isMandatory: PropTypes.bool,
     disableDefaultOption: PropTypes.bool,
     selectClassName: PropTypes.string,
     blurCallBack: PropTypes.func
 };
 
 selectField.defaultProps = {
     defaultValue: '',
     changeCallback: () => {},
     blurCallBack: () => {}
 };
 