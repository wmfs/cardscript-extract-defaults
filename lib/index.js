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
        if (element.parametersCard) {
          apiLookupPath.push(element.id)
          defaultValues.rootView[element.id].params = {}
          element.parametersCard.body.forEach(parseElement)
          apiLookupPath.pop()
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
        if (element.openable) {
          if (cardListPath.length === 0) {
            defaultValues.rootView[element.id + 'OpenModal'] = false
          } else {
            const cardListId = cardListPath[cardListPath.length - 1]
            defaultValues.cardLists[cardListId][element.id + 'OpenModal'] = false
          }
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

  if (type === 'Input.Text' && editor) {
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
