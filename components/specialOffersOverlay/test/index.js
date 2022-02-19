import React from 'react';
import { mount } from 'enzyme';
import { assert } from 'chai';
import { expect } from 'chai';
import sinon from 'sinon';
import analytics from '../../commons/analytics';


import SpecialOffersOverlay from '../index';
import data from '../data/customData';

suite('<SpecialOffersOverlay />', () => {
    let closeClicked = false;

    let hideOfferMethod = {
        hideOffersOverlay: function () {
            closeClicked = true;
        }
    };

    const componentProps = Object.assign(data.attributes, hideOfferMethod);

    let wrapper;

    setup(() => {
        wrapper = mount(< SpecialOffersOverlay { ...componentProps } />);
    });

    test('Close Button Click Works', () => {
        wrapper.find('.offers-close-img').simulate('click');
        expect(closeClicked).to.equal(true);
        closeClicked = false;
    });

    test('Number of offers', () => {
        setTimeout(() => {
            let wrapperLength = wrapper.find('.offers-overlay-wrapper').length;

            assert.equal(componentProps.specialOffers.length, parseInt(wrapperLength));
        }, 50);
    });

    test( 'Model Open Works', () => {
        let stub = sinon.stub(wrapper.instance(), 'render').returns(null);

        wrapper.instance().handleModal(true, () => {
            assert.equal(wrapper.state().showModal, true);
        });
        wrapper.instance().handleModal(false, () => {
            assert.equal(wrapper.state().showModal, false);
        });
        stub.restore();
    });

    test('Should call analytics click', () => {
        window.dtm_digitalData = {};
        let analyticsStub = sinon.stub(analytics, 'customClicks');

        wrapper.instance().handleAnalytics('hi', 'hello');
        assert.equal(analyticsStub.called, true);
        analyticsStub.restore();
    });

    test('One offer present', () => {
        componentProps.specialOffers = [
            {
                'features': [
                    '12',
                    '34'
                ],
                'featuresSelector': 'icon',
                'description': '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur at porta ligula. Etiam ornare ipsum enim, tempus gravida ligula tincidunt ut. Nulla bibendum pretium pharetra. Praesent vulputate fermentum tortor quis tempus. Vivamus mollis tellus nulla, quis molestie ligula mattis non. Phasellus eleifend convallis turpis, id iaculis nulla pretium et.</p>\r\n\r\n',
                'expiryDate': '2017-04-20T22:23:00.000+05:30',
                'logo': '/content/dam/carnival/C037_Icon.png',
                'name': 'Explore 4',
                'subHeader': ' ',
                'termsCtaText': 'Terms and Condition',
                'termsCtaTarget': '',
                'termsModalBackToTop': 'top',
                'termsModalText': '<p>Terms &amp; Condition</p>\r\n\r\n',
                'title': '',
                'backgroundTexture': '/etc/designs/carnival/platform/images/textures/contour.png',
                'logoAltText': '',
                'image': {
                    '0': {
                        '1x': '/content/dam/carnival/Jellyfish.jpg.image.320.353.low.jpg',
                        '2x': '/content/dam/carnival/Jellyfish.jpg.image.640.706.low.jpg'
                    },
                    '376': {
                        '1x': '/content/dam/carnival/Jellyfish.jpg.image.768.576.medium.jpg',
                        '2x': '/content/dam/carnival/Jellyfish.jpg.image.1536.1152.medium.jpg'
                    },
                    '769': {
                        '1x': '/content/dam/carnival/Jellyfish.jpg.image.1480.538.high.jpg',
                        '2x': '/content/dam/carnival/Jellyfish.jpg.image.2960.1076.high.jpg'
                    },
                    'alt': ''
                }
            }
        ];
        wrapper = mount(<SpecialOffersOverlay { ...componentProps } />);
        assert.equal(wrapper.find('.offers-overlay-wrapper').length, 1);
    });

    test('Two offers present', () => {
        setTimeout(() => {
            componentProps.specialOffers = [
                {
                    '97323': {
                        'id': '97323',
                        'features': [
                            '12',
                            '34'
                        ],
                        'featuresSelector': 'icon',
                        'description': '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur at porta ligula. Etiam ornare ipsum enim, tempus gravida ligula tincidunt ut. Nulla bibendum pretium pharetra. Praesent vulputate fermentum tortor quis tempus. Vivamus mollis tellus nulla, quis molestie ligula mattis non. Phasellus eleifend convallis turpis, id iaculis nulla pretium et.</p>\r\n\r\n',
                        'expiryDate': '2017-04-20T22:23:00.000+05:30',
                        'logo': {
                            'alt': 'Logo',
                            'image': 'https://placeholdit.imgix.net/~text?txtsize=42&txt=x&w=70&h=70&txttrack=0'
                        },
                        'name': 'Explore 4',
                        'subHeader': ' ',
                        'termsCtaText': 'Terms and condition',
                        'termsCtaTarget': '',
                        'termsModalBackToTop': 'top',
                        'termsModalText': '<p>Terms &amp; Condition</p>\r\n\r\n',
                        'title': 'Title',
                        'backgroundTexture': 'https://placeholdit.imgix.net/~text?txtsize=42&txt=x&w=70&h=70&txttrack=0',
                        'image': {
                            '0': {
                                '1x': '/content/dam/carnival/Jellyfish.jpg.image.320.353.low.jpg',
                                '2x': '/content/dam/carnival/Jellyfish.jpg.image.640.706.low.jpg'
                            },
                            '376': {
                                '1x': '/content/dam/carnival/Jellyfish.jpg.image.768.576.medium.jpg',
                                '2x': '/content/dam/carnival/Jellyfish.jpg.image.1536.1152.medium.jpg'
                            },
                            '769': {
                                '1x': '/content/dam/carnival/Jellyfish.jpg.image.1480.538.high.jpg',
                                '2x': '/content/dam/carnival/Jellyfish.jpg.image.2960.1076.high.jpg'
                            },
                            'alt': ''
                        }
                    }
                },
                {
                    '97876': {
                        'id': '97876',
                        'features': [
                            '12',
                            '34'
                        ],
                        'featuresSelector': 'icon',
                        'description': '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur at porta ligula. Etiam ornare ipsum enim, tempus gravida ligula tincidunt ut. Nulla bibendum pretium pharetra. Praesent vulputate fermentum tortor quis tempus. Vivamus mollis tellus nulla, quis molestie ligula mattis non. Phasellus eleifend convallis turpis, id iaculis nulla pretium et.</p>\r\n\r\n',
                        'expiryDate': '2017-04-20T22:23:00.000+05:30',
                        'logo': {
                            'alt': 'Logo',
                            'image': 'https://placeholdit.imgix.net/~text?txtsize=42&txt=x&w=70&h=70&txttrack=0'
                        },
                        'name': 'Explore 4',
                        'subHeader': ' ',
                        'termsCtaText': 'Terms and Condition',
                        'termsCtaTarget': '',
                        'termsModalBackToTop': 'top',
                        'termsModalText': '<p>Terms &amp; Condition</p>\r\n\r\n',
                        'title': 'Title',
                        'backgroundTexture': '/etc/designs/carnival/platform/images/textures/contour.png',
                        'image': {
                            '0': {
                                '1x': '/content/dam/carnival/Jellyfish.jpg.image.320.353.low.jpg',
                                '2x': '/content/dam/carnival/Jellyfish.jpg.image.640.706.low.jpg'
                            },
                            '376': {
                                '1x': '/content/dam/carnival/Jellyfish.jpg.image.768.576.medium.jpg',
                                '2x': '/content/dam/carnival/Jellyfish.jpg.image.1536.1152.medium.jpg'
                            },
                            '769': {
                                '1x': '/content/dam/carnival/Jellyfish.jpg.image.1480.538.high.jpg',
                                '2x': '/content/dam/carnival/Jellyfish.jpg.image.2960.1076.high.jpg'
                            },
                            'alt': ''
                        }
                    }
                }
            ];
            wrapper = mount(<SpecialOffersOverlay { ...componentProps } />);
            assert.equal(wrapper.find('.offers-overlay-wrapper').length, 2);
        }, 50);
    });

    test('Three offers present', () => {
        setTimeout(() => {
            componentProps.specialOffers = [
                {
                    '97323': {
                        'id': '97323',
                        'features': [
                            '12',
                            '34'
                        ],
                        'featuresSelector': 'icon',
                        'description': '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur at porta ligula. Etiam ornare ipsum enim, tempus gravida ligula tincidunt ut. Nulla bibendum pretium pharetra. Praesent vulputate fermentum tortor quis tempus. Vivamus mollis tellus nulla, quis molestie ligula mattis non. Phasellus eleifend convallis turpis, id iaculis nulla pretium et.</p>\r\n\r\n',
                        'expiryDate': '2017-04-20T22:23:00.000+05:30',
                        'logo': {
                            'alt': 'Logo',
                            'image': 'https://placeholdit.imgix.net/~text?txtsize=42&txt=x&w=70&h=70&txttrack=0'
                        },
                        'name': 'Explore 4',
                        'subHeader': ' ',
                        'termsCtaText': 'Terms and condition',
                        'termsCtaTarget': '',
                        'termsModalBackToTop': 'top',
                        'termsModalText': '<p>Terms &amp; Condition</p>\r\n\r\n',
                        'title': 'Title',
                        'backgroundTexture': 'https://placeholdit.imgix.net/~text?txtsize=42&txt=x&w=70&h=70&txttrack=0',
                        'image': {
                            '0': {
                                '1x': '/content/dam/carnival/Jellyfish.jpg.image.320.353.low.jpg',
                                '2x': '/content/dam/carnival/Jellyfish.jpg.image.640.706.low.jpg'
                            },
                            '376': {
                                '1x': '/content/dam/carnival/Jellyfish.jpg.image.768.576.medium.jpg',
                                '2x': '/content/dam/carnival/Jellyfish.jpg.image.1536.1152.medium.jpg'
                            },
                            '769': {
                                '1x': '/content/dam/carnival/Jellyfish.jpg.image.1480.538.high.jpg',
                                '2x': '/content/dam/carnival/Jellyfish.jpg.image.2960.1076.high.jpg'
                            },
                            'alt': ''
                        }
                    }
                },
                {
                    '97876': {
                        'id': '97876',
                        'features': [
                            '12',
                            '34'
                        ],
                        'featuresSelector': 'icon',
                        'description': '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur at porta ligula. Etiam ornare ipsum enim, tempus gravida ligula tincidunt ut. Nulla bibendum pretium pharetra. Praesent vulputate fermentum tortor quis tempus. Vivamus mollis tellus nulla, quis molestie ligula mattis non. Phasellus eleifend convallis turpis, id iaculis nulla pretium et.</p>\r\n\r\n',
                        'expiryDate': '2017-04-20T22:23:00.000+05:30',
                        'logo': {
                            'alt': 'Logo',
                            'image': 'https://placeholdit.imgix.net/~text?txtsize=42&txt=x&w=70&h=70&txttrack=0'
                        },
                        'name': 'Explore 4',
                        'subHeader': ' ',
                        'termsCtaText': 'Terms and Condition',
                        'termsCtaTarget': '',
                        'termsModalBackToTop': 'top',
                        'termsModalText': '<p>Terms &amp; Condition</p>\r\n\r\n',
                        'title': 'Title',
                        'backgroundTexture': '/etc/designs/carnival/platform/images/textures/contour.png',
                        'image': {
                            '0': {
                                '1x': '/content/dam/carnival/Jellyfish.jpg.image.320.353.low.jpg',
                                '2x': '/content/dam/carnival/Jellyfish.jpg.image.640.706.low.jpg'
                            },
                            '376': {
                                '1x': '/content/dam/carnival/Jellyfish.jpg.image.768.576.medium.jpg',
                                '2x': '/content/dam/carnival/Jellyfish.jpg.image.1536.1152.medium.jpg'
                            },
                            '769': {
                                '1x': '/content/dam/carnival/Jellyfish.jpg.image.1480.538.high.jpg',
                                '2x': '/content/dam/carnival/Jellyfish.jpg.image.2960.1076.high.jpg'
                            },
                            'alt': ''
                        }
                    }
                },
                {
                    '97846': {
                        'id': '97846',
                        'features': [
                            '12',
                            '34'
                        ],
                        'featuresSelector': 'icon',
                        'description': '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur at porta ligula. Etiam ornare ipsum enim, tempus gravida ligula tincidunt ut. Nulla bibendum pretium pharetra. Praesent vulputate fermentum tortor quis tempus. Vivamus mollis tellus nulla, quis molestie ligula mattis non. Phasellus eleifend convallis turpis, id iaculis nulla pretium et.</p>\r\n\r\n',
                        'expiryDate': '2017-04-20T22:23:00.000+05:30',
                        'logo': {
                            'alt': 'Logo',
                            'image': 'https://placeholdit.imgix.net/~text?txtsize=42&txt=x&w=70&h=70&txttrack=0'
                        },
                        'name': 'Explore 4',
                        'subHeader': ' ',
                        'termsCtaText': '<p>Terms &amp; Condition</p>\r\n\r\n',
                        'termsCtaTarget': '',
                        'termsModalBackToTop': 'top',
                        'termsModalText': '<p>Terms &amp; Condition</p>\r\n\r\n',
                        'title': 'Title',
                        'backgroundTexture': '/etc/designs/carnival/platform/images/textures/contour.png',
                        'image': {
                            '0': {
                                '1x': '/content/dam/carnival/Jellyfish.jpg.image.320.353.low.jpg',
                                '2x': '/content/dam/carnival/Jellyfish.jpg.image.640.706.low.jpg'
                            },
                            '376': {
                                '1x': '/content/dam/carnival/Jellyfish.jpg.image.768.576.medium.jpg',
                                '2x': '/content/dam/carnival/Jellyfish.jpg.image.1536.1152.medium.jpg'
                            },
                            '769': {
                                '1x': '/content/dam/carnival/Jellyfish.jpg.image.1480.538.high.jpg',
                                '2x': '/content/dam/carnival/Jellyfish.jpg.image.2960.1076.high.jpg'
                            },
                            'alt': ''
                        }
                    }
                }
            ];
            wrapper = mount(<SpecialOffersOverlay { ...componentProps } />);
            assert.equal(wrapper.find('.offers-overlay-wrapper').length, 3);
        });
    }, 50);
});