const marked = require('marked')

module.exports = function extractDefaults (cardscript) {
  const apiLookupPath = []
  const cardListPath = []
  const defaultValues = {
    rootView: {},
    cardLists: {}
  }

  function parseElement (element) {
    const defaultValue = extractDefaultValue(element)

    switch (element.type) {
      case 'Container':
        element.items.forEach(parseElement)
        break
      case 'ColumnSet':
        element.columns.forEach(parseElement)
        break
      case 'Column':
        element.items.forEach(parseElement)
        break
      case 'FactSet':
        element.facts.forEach(parseElement)
        break
      case 'Collapsible':
        element.card.body.forEach(parseElement)
        break
      case 'Input.ApiLookup':
        defaultValues.rootView[element.id] = {
          loading: false,
          summary: {
            totalHits: 0
          },
          results: [],
          pagination: {
            page: 1,
            totalPages: 0,
            offset: 0,
            limit: element.resultsPerPage || 10
          }
        }

        apiLookupPath.push(element.id)
        defaultValues.rootView[element.id].params = {}

        if (element.parametersCard) {
          element.parametersCard.body.forEach(parseElement)
        }

        if (element.resultsCard) {
          element.resultsCard.body.forEach(parseElement)
        }

        apiLookupPath.pop()

        if (element.selectionType === 'single') {
          defaultValues.rootView[element.id].selected = {}
        }

        if (element.selectionType === 'multi') {
          defaultValues.rootView[element.id].selected = []
        }
        break
      case 'CardList':
        // todo: apiLookupPath
        if (element.editable) {
          if (cardListPath.length === 0) {
            defaultValues.rootView[element.id] = []
          } else {
            const cardListId = cardListPath[cardListPath.length - 1]
            defaultValues.cardLists[cardListId][element.id] = []
          }
          cardListPath.push(element.id)
          defaultValues.cardLists[element.id] = {}
          element.card.body.forEach(parseElement)
          cardListPath.pop()
        }

        break
      case 'Input.Date':
      case 'Input.Number':
      case 'Input.Slider':
      case 'Input.Text':
      case 'Input.Name':
      case 'Input.Email':
      case 'Input.TelephoneNumber':
      case 'Input.Time':
      case 'Input.ChoiceSet':
      case 'Input.Toggle':
        if (defaultValue !== undefined) {
          if (cardListPath.length === 0) {
            if (apiLookupPath.length === 0) {
              defaultValues.rootView[element.id] = defaultValue
            } else {
              const apiLookupId = apiLookupPath[apiLookupPath.length - 1]
              defaultValues.rootView[apiLookupId].params[element.id] = defaultValue
            }
          } else {
            if (apiLookupPath.length === 0) {
              const cardListId = cardListPath[cardListPath.length - 1]
              defaultValues.cardLists[cardListId][element.id] = defaultValue
            } else {
              // TODO: not sure about this...
              const apiLookupId = apiLookupPath[apiLookupPath.length - 1]
              const cardListId = cardListPath[cardListPath.length - 1]
              defaultValues.cardLists[apiLookupId].params[cardListId][element.id] = defaultValue
            }
          }
        }
        break
      case 'Input.Address':
        // todo: apiLookupPath
        if (cardListPath.length === 0) {
          defaultValues.rootView[element.id + 'SearchResults'] = []
        } else {
          const cardListId = cardListPath[cardListPath.length - 1]
          defaultValues.cardLists[cardListId][element.id + 'SearchResults'] = []
        }
        break
      case 'Input.Signature':
        // todo: apiLookupPath
        if (cardListPath.length === 0) {
          defaultValues.rootView[element.id + 'OpenModal'] = false
        } else {
          const cardListId = cardListPath[cardListPath.length - 1]
          defaultValues.cardLists[cardListId][element.id + 'OpenModal'] = false
        }
        break
      case 'Table':
        // todo: apiLookupPath
        if (element.selectionType) {
          const selected = element.selectionType === 'single' ? {} : []
          if (cardListPath.length === 0) {
            defaultValues.rootView[element.id + 'Selected'] = selected
          } else {
            const cardListId = cardListPath[cardListPath.length - 1]
            defaultValues.cardLists[cardListId][element.id + 'Selected'] = selected
          }
        }
        break
      case 'TabSet':
        if (cardListPath.length === 0) {
          defaultValues.rootView[element.id + 'TabSet'] = 'tab-0'
        } else {
          const cardListId = cardListPath[cardListPath.length - 1]
          defaultValues.cardLists[cardListId][element.id + 'TabSet'] = 'tab-0'
        }

        element.tabs.forEach(parseElement)
        break
      case 'Tab':
        element.items.forEach(parseElement)
        break
      case 'List':
        if (element.selectionType === 'single' || element.selectionType === 'multi') {
          const defaultValue = element.selectionType === 'single' ? {} : []

          if (cardListPath.length === 0) {
            if (apiLookupPath.length === 0) {
              defaultValues.rootView[element.id] = defaultValue
            } else {
              const apiLookupId = apiLookupPath[apiLookupPath.length - 1]
              defaultValues.rootView[apiLookupId].params[element.id] = defaultValue
            }
          } else {
            if (apiLookupPath.length === 0) {
              const cardListId = cardListPath[cardListPath.length - 1]
              defaultValues.cardLists[cardListId][element.id] = defaultValue
            } else {
              // TODO: not sure about this...
              const apiLookupId = apiLookupPath[apiLookupPath.length - 1]
              const cardListId = cardListPath[cardListPath.length - 1]
              defaultValues.cardLists[apiLookupId].params[cardListId][element.id] = defaultValue
            }
          }
        }
        break
      case 'Map':
      case 'Input.Map':
        const markers = element.markers ? [...element.markers] : []
        if (element.centre && element.centre.show) markers.push(element.centre)

        for (const [idx] of markers.entries()) {
          const id_ = `MAP_PROMPT_${idx}`
          const defaultValue_ = {
            show: false,
            lat: null,
            lng: null
          }
          if (cardListPath.length === 0) {
            if (apiLookupPath.length === 0) {
              defaultValues.rootView[id_] = defaultValue_
            } else {
              const apiLookupId = apiLookupPath[apiLookupPath.length - 1]
              defaultValues.rootView[apiLookupId].params[id_] = defaultValue_
            }
          } else {
            if (apiLookupPath.length === 0) {
              const cardListId = cardListPath[cardListPath.length - 1]
              defaultValues.cardLists[cardListId][id_] = defaultValue_
            } else {
              // TODO: not sure about this...
              const apiLookupId = apiLookupPath[apiLookupPath.length - 1]
              const cardListId = cardListPath[cardListPath.length - 1]
              defaultValues.cardLists[apiLookupId].params[cardListId][id_] = defaultValue_
            }
          }
        }

        break
      case 'TextBlock':
        if (element.id && element.markdown) {
          // todo: cardList & apiLookup

          const compiledMarkdown = marked(element.text, { sanitize: true })
          defaultValues.rootView[`${element.id}CompiledMarkdown`] = compiledMarkdown
        }
        break
    }
  }

  cardscript.body.forEach(parseElement)

  return defaultValues
}

function extractDefaultValue ({ type, value, isMultiSelect, editor }) {
  let defaultValue = value

  if (isMultiSelect) {
    defaultValue = value ? value.split(',') : []
  }

  if (!defaultValue && type === 'Input.Text' && editor) {
    // Some text editors don't like being passed null...
    defaultValue = ''
  }

  if (type === 'Input.Toggle') {
    if (value !== undefined) {
      if (value === 'true') defaultValue = true
      if (value === 'false') defaultValue = false
    } else {
      defaultValue = false
    }
  }

  if (defaultValue === undefined) {
    defaultValue = null
  }
  return defaultValue
}
