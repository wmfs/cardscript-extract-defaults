/* eslint-env mocha */

const extractDefaults = require('./../lib/')
const chai = require('chai')
const expect = chai.expect
const { simple, complex, kitchenSink, cardList } = require('@wmfs/cardscript-examples')

describe('Run some Cardscript default-extracting tests', function () {
  it('should extract no defaults from some simple example', async function () {
    const result = await extractDefaults(simple)
    expect(result).to.eql(
      {
        rootView: {
          $CARD_DATA_HAS_CHANGED: false,
          $GEOLOCATION: null,
          name: null
        },
        cardLists: {}
      }
    )
  })

  it('should extract some defaults from complex example', async function () {
    const result = await extractDefaults(complex)
    expect(result).to.eql(
      {
        cardLists: {},
        rootView: {
          $CARD_DATA_HAS_CHANGED: false,
          $GEOLOCATION: null,
          base: 'TOMATO',
          deliveryOrCollection: 'COLLECT',
          dietaryReq: [],
          dietaryReqOther: null,
          name: null,
          hot: false,
          howHot: null,
          phoneNumber: null,
          primaryFlavour: null,
          savouryOrSweet: null,
          secondaryFlavour: null,
          size: 'M',
          sprinkles: false,
          toppings: []
        }
      }
    )
  })

  it('should extract some defaults from kitchen sink example', async function () {
    const result = await extractDefaults(kitchenSink)
    expect(result).to.eql({
      rootView: {
        $CARD_DATA_HAS_CHANGED: false,
        $GEOLOCATION: null,
        cardList: [],
        cardListNonEditable: [],
        toggle: false,
        tabSetTabSet: 'tab-0',
        tabSetTabSetShowWhens: [
          undefined,
          undefined
        ],
        choice: 'CHOICE_1',
        choiceMulti: ['CHOICE_1', 'CHOICE_2'],
        choiceWithTitle: 'CHOICE_1',
        date: null,
        dateTime: null,
        dateTimeSeconds: null,
        email: null,
        slider: 3,
        tableWithMultiSelectionSelected: [],
        tableWithSingleSelectionSelected: [],
        text: null,
        textMultiline: 'isMultiline: true',
        time: null,
        textEditor: 'editor: true',
        inputAddressSearchResults: [],
        inputSignatureOpenModal: false,
        inputTelephoneNumber: null,
        listMultiSelection: [],
        listSingleSelection: {},
        markdownTextBlockCompiledMarkdown: '<h2>Markdown</h2>\n<blockquote>\n<p>This is some markdown text</p>\n</blockquote>\n<h2>Heading</h2>\n<p>Some text here...</p>\n<ul>\n<li>one</li>\n<li>two</li>\n<li>three</li>\n</ul>\n',
        name: null,
        number: null,
        numberWithMinMax: null,
        inputApiLookup: {
          loading: false,
          params: {
            searchQuery: null,
            sortBy: 'MOST_RECENT'
          },
          results: [],
          pagination: {
            page: 1,
            totalPages: 0,
            limit: 10,
            offset: 0
          },
          summary: {
            totalHits: 0
          }
        },
        treeMulti: [
          {
            children: [
              {
                label: 'Car',
                value: 'CAR'
              },
              {
                label: 'Train',
                value: 'TRAIN'
              },
              {
                label: 'Bus',
                value: 'BUS'
              }
            ],
            label: 'Vehicle'
          },
          {
            children: [
              {
                label: 'House',
                value: 'HOUSE'
              },
              {
                label: 'Flat',
                value: 'FLAT'
              }
            ],
            label: 'Building'
          }
        ],
        treeMultiSelected: [],
        treeSimple: [
          {
            children: [
              {
                label: 'Car'
              },
              {
                label: 'Train'
              },
              {
                label: 'Bus'
              }
            ],
            label: 'Vehicle'
          },
          {
            children: [
              {
                label: 'House'
              },
              {
                label: 'Flat'
              }
            ],
            label: 'Building'
          }
        ],
        treeSingle: [
          {
            children: [
              {
                label: 'Car',
                value: 'CAR'
              },
              {
                label: 'Train',
                value: 'TRAIN'
              },
              {
                label: 'Bus',
                value: 'BUS'
              }
            ],
            label: 'Vehicle'
          },
          {
            children: [
              {
                label: 'House',
                value: 'HOUSE'
              },
              {
                label: 'Flat',
                value: 'FLAT'
              }
            ],
            label: 'Building'
          }
        ],
        treeSingleSelected: {}
      },
      cardLists: {
        cardList: {
          opinion: 'Amazing!'
        },
        cardListNonEditable: {}
      }
    })
  })

  xit('should extract some defaults from cardList example', async function () {
    const result = await extractDefaults(cardList)
    expect(result).to.eql({
      rootView: {
        starters: [],
        pizzas: []
      },
      cardLists: {
        starters: {
          starterQuantity: 2,
          starterType: 'WEDGES'
        },
        pizzas: {
          pizzaQuantity: 1,
          dips: [],
          pizzaType: 'HAWAIIAN'
        },
        dips: {
          dipQuantity: 3,
          dipType: 'BBQ'
        }
      }
    })
  })
})
