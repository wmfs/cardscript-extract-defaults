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
        rootView: {
          $CARD_DATA_HAS_CHANGED: false,
          $GEOLOCATION: null,
          name: null,
          phoneNumber: null,
          dietaryReq: [],
          dietaryReqSelectedChoices: [],
          dietaryReqOther: null,
          size: 'M',
          sizeSelectedChoices: [],
          savouryOrSweet: null,
          savouryOrSweetSelectedChoices: [],
          base: 'TOMATO',
          baseSelectedChoices: [],
          hot: false,
          howHot: null,
          howHotSelectedChoices: [],
          toppings: [],
          toppingsSelectedChoices: [],
          primaryFlavour: null,
          primaryFlavourSelectedChoices: [],
          secondaryFlavour: null,
          secondaryFlavourSelectedChoices: [],
          sprinkles: false,
          deliveryOrCollection: 'COLLECT',
          deliveryOrCollectionSelectedChoices: []
        },
        cardLists: {}
      }
    )
  })

  it('should extract some defaults from kitchen sink example', async function () {
    const result = await extractDefaults(kitchenSink)
    expect(result).to.eql(
      {
        rootView: {
          $CARD_DATA_HAS_CHANGED: false,
          $GEOLOCATION: null,
          cardList: [],
          cardListNonEditable: [],
          inputAddressSearchResults: [],
          inputApiLookup: {
            loading: false,
            summary: { totalHits: 0 },
            results: [],
            pagination: { page: 1, totalPages: 0, offset: 0, limit: 10 },
            params: { searchQuery: null, sortBy: 'MOST_RECENT', sortBySelectedChoices: [] }
          },
          choice: 'CHOICE_1',
          choiceSelectedChoices: [],
          choiceWithTitle: 'CHOICE_1',
          choiceWithTitleSelectedChoices: [],
          choiceMulti: ['CHOICE_1', 'CHOICE_2'],
          choiceMultiSelectedChoices: [],
          date: null,
          dateTime: null,
          dateTimeSeconds: null,
          email: null,
          name: null,
          number: null,
          numberWithMinMax: null,
          inputSignatureOpenModal: false,
          slider: 3,
          inputTelephoneNumber: null,
          text: null,
          textMultiline: 'isMultiline: true',
          textEditor: 'editor: true',
          time: null,
          toggle: false,
          listSingleSelection: {},
          listMultiSelection: [],
          tableWithSingleSelectionSelected: [],
          tableWithMultiSelectionSelected: [],
          tabSetTabSet: 'tab-0',
          tabSetTabSetShowWhens: [undefined, undefined],
          markdownTextBlockCompiledMarkdown: '<h2 id="markdown">Markdown</h2>\n<blockquote>\n<p>This is some markdown text</p>\n</blockquote>\n<h2 id="heading">Heading</h2>\n<p>Some text here...</p>\n<ul>\n<li>one</li>\n<li>two</li>\n<li>three</li>\n</ul>\n',
          treeSimple: [{
            label: 'Vehicle',
            children: [{ label: 'Car' }, { label: 'Train' }, { label: 'Bus' }]
          }, { label: 'Building', children: [{ label: 'House' }, { label: 'Flat' }] }],
          treeSingle: [{
            label: 'Vehicle',
            children: [{ label: 'Car', value: 'CAR' }, { label: 'Train', value: 'TRAIN' }, {
              label: 'Bus',
              value: 'BUS'
            }]
          }, { label: 'Building', children: [{ label: 'House', value: 'HOUSE' }, { label: 'Flat', value: 'FLAT' }] }],
          treeSingleSelected: {},
          treeMulti: [{
            label: 'Vehicle',
            children: [{ label: 'Car', value: 'CAR' }, { label: 'Train', value: 'TRAIN' }, {
              label: 'Bus',
              value: 'BUS'
            }]
          }, { label: 'Building', children: [{ label: 'House', value: 'HOUSE' }, { label: 'Flat', value: 'FLAT' }] }],
          treeMultiSelected: []
        },
        cardLists: { cardList: { opinion: 'Amazing!' }, cardListNonEditable: {} }
      }
    )
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
