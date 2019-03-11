/* eslint-env mocha */

'use strict'
const extractDefaults = require('./../lib/')
const chai = require('chai')
const expect = chai.expect
const { simple, complex, kitchenSink, cardList } = require('@wmfs/cardscript-examples')

describe('Run some Cardscript default-extracting tests', function () {
  it('should extract no defaults from some simple example', function () {
    const result = extractDefaults(simple)
    expect(result).to.eql(
      {
        rootView: {
          name: null
        },
        cardLists: {}
      }
    )
  })

  it('should extract some defaults from complex example', function () {
    const result = extractDefaults(complex)
    expect(result).to.eql(
      {
        cardLists: {},
        rootView: {
          base: 'TOMATO',
          deliveryOrCollection: 'COLLECT',
          dietaryReq: [],
          dietaryReqOther: null,
          firstName: null,
          hot: false,
          howHot: null,
          lastName: null,
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

  it('should extract some defaults from kitchen sink example', function () {
    const result = extractDefaults(kitchenSink)
    expect(result).to.eql({
      rootView: {
        cardList: [],
        toggle: false,
        choice: 'CHOICE_1',
        choiceMulti: ['CHOICE_1', 'CHOICE_2'],
        choiceWithTitle: 'CHOICE_1',
        date: null,
        email: null,
        slider: 3,
        text: null,
        time: null,
        textEditor: 'editor: true',
        inputAddressSearchResults: [],
        inputSignatureOpenModal: false,
        inputTelephoneNumber: null,
        name: null,
        number: null,
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
        }
      },
      cardLists: {
        cardList: {
          opinion: 'Amazing!'
        }
      }
    })
  })

  it('should extract some defaults from cardList example', function () {
    const result = extractDefaults(cardList)
    expect(result).to.eql({
      rootView: {
        starters: [],
        pizzas: []
      },
      cardLists: {
        starters: {
          starterQuantity: 2,
          starterType: null
        },
        pizzas: {
          pizzaQuantity: 1,
          dips: [],
          pizzaType: null
        },
        dips: {
          dipQuantity: 3,
          dipType: null
        }
      }
    })
  })
})
