const marked = require('marked')
const dottie = require('dottie')

module.exports = function extractDefaults (cardscript) {
  const defaultValues = {
    rootView: {},
    cardLists: {}
  }

  const apiLookupPath = []
  const cardListPath = []

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
        if (Array.isArray(element.facts)) {
          element.facts.forEach(parseElement)
        }
        break
      case 'Collapsible':
        element.card.body.forEach(parseElement)
        break
      case 'Input.ApiLookup':
        const defaultValue_ = {
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
          },
          params: {}
        }

        applyDefaultValue(defaultValues, defaultValue_, apiLookupPath, cardListPath, element.id)

        apiLookupPath.push(element.id)

        if (element.parametersCard) element.parametersCard.body.forEach(parseElement)
        if (element.resultsCard) element.resultsCard.body.forEach(parseElement)

        apiLookupPath.pop()
        break
      case 'CardList':
        applyDefaultValue(defaultValues, [], apiLookupPath, cardListPath, element.id)

        cardListPath.push(element.id)

        defaultValues.cardLists[element.id] = {}
        element.card.body.forEach(parseElement)

        cardListPath.pop()

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
          applyDefaultValue(defaultValues, defaultValue, apiLookupPath, cardListPath, element.id)
        }
        break
      case 'Input.Address':
        applyDefaultValue(defaultValues, [], apiLookupPath, cardListPath, `${element.id}SearchResults`)
        break
      case 'Input.Signature':
        applyDefaultValue(defaultValues, false, apiLookupPath, cardListPath, `${element.id}OpenModal`)
        break
      case 'Table':
        if (element.selectionType) {
          applyDefaultValue(defaultValues, [], apiLookupPath, cardListPath, `${element.id}Selected`)
        }
        break
      case 'TabSet':
        applyDefaultValue(defaultValues, 'tab-0', apiLookupPath, cardListPath, `${element.id}TabSet`)

        element.tabs.forEach(parseElement)
        break
      case 'Tab':
        element.items.forEach(parseElement)
        break
      case 'List':
        if (element.selectionType === 'single' || element.selectionType === 'multi') {
          const defaultValue = element.selectionType === 'single' ? {} : []

          applyDefaultValue(defaultValues, defaultValue, apiLookupPath, cardListPath, element.id)
        }
        break
      case 'Map':
      case 'Input.Map':
        const markers = element.markers ? [...element.markers] : []
        if (element.centre && element.centre.show) markers.push(element.centre)

        for (const [idx, m] of markers.entries()) {
          const id_ = `MAP_PROMPT_${idx}`
          const defaultValue_ = {
            show: false,
            lat: m.defaultLatitude || null,
            lng: m.defaultLongitude || null,
            x: m.defaultX || null,
            y: m.defaultY || null
          }

          applyDefaultValue(defaultValues, defaultValue_, apiLookupPath, cardListPath, id_)
        }

        break
      case 'TextBlock':
        if (element.id && element.markdown) {
          const compiledMarkdown = marked(element.text, { sanitize: true })
          applyDefaultValue(defaultValues, compiledMarkdown, apiLookupPath, cardListPath, `${element.id}CompiledMarkdown`)
        }
        break
      case 'Tree':
        applyDefaultValue(defaultValues, element.nodes, apiLookupPath, cardListPath, element.id)
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

function applyDefaultValue (defaultValues, defaultValue, apiLookupPath, cardListPath, id) {
  const defaultRootViewPath = ['rootView']
  const defaultCardListsPath = ['cardLists']

  const apiLookupId = apiLookupPath.length > 0 ? apiLookupPath[apiLookupPath.length - 1] : null
  const cardListId = cardListPath.length > 0 ? cardListPath[cardListPath.length - 1] : null

  if (!cardListId && !apiLookupId) {
    defaultRootViewPath.push(id)
  }

  if (!cardListId && apiLookupId) {
    defaultRootViewPath.push(apiLookupId, 'params', id)
  }

  if (cardListId && !apiLookupId) {
    defaultCardListsPath.push(cardListId, id)
    // defaultRootViewPath.push(cardListId, id)
  }

  if (cardListId && apiLookupId) {
    const isCardListOnRoot = !!dottie.get(defaultValues, `rootView.${cardListId}`)
    const isCardListOnApiLookup = !!dottie.get(defaultValues, `rootView.${apiLookupId}.params.${cardListId}`)

    if (isCardListOnRoot) {
      defaultCardListsPath.push(cardListId, apiLookupId, 'params', id)
      defaultRootViewPath.push(cardListId, apiLookupId, 'params', id)
    } else if (isCardListOnApiLookup) {
      defaultCardListsPath.push(apiLookupId, 'params', cardListId, id)
      // defaultRootViewPath.push(apiLookupId, 'params', cardListId, id)
    }
  }

  if (defaultRootViewPath.length > 1) dottie.set(defaultValues, defaultRootViewPath.join('.'), defaultValue)
  if (defaultCardListsPath.length > 1) dottie.set(defaultValues, defaultCardListsPath.join('.'), defaultValue)
}
