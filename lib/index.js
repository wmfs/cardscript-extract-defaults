const { marked } = require('marked')
const dottie = require('dottie')

module.exports = async function extractDefaults (cardscript) {
  const defaultValues = {
    rootView: {},
    cardLists: {}
  }

  defaultValues.rootView.$CARD_DATA_HAS_CHANGED = false

  try {
    const position = await getCurrentPosition()
    const lng = position.coords.longitude
    const lat = position.coords.latitude
    defaultValues.rootView.$GEOLOCATION = { lat, lng }
  } catch (err) {
    defaultValues.rootView.$GEOLOCATION = null
    console.log('Geolocation is not supported by this browser')
  }

  const apiLookupPath = []
  const cardListPath = []

  function parseElement (element) {
    const defaultValue = extractDefaultValue(element)

    switch (element.type) {
      case 'Container':
      case 'Column':
      case 'Tab':
      case 'Step':
        element.items.forEach(parseElement)
        break
      case 'ColumnSet':
        element.columns.forEach(parseElement)
        break
      case 'FactSet':
        if (Array.isArray(element.facts)) {
          element.facts.forEach(parseElement)
        }
        break
      case 'Collapsible':
        element.card.body.forEach(parseElement)
        break
      case 'Input.ApiLookup': {
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
      }
      case 'CardList':
        applyDefaultValue(defaultValues, [], apiLookupPath, cardListPath, element.id)

        if (element.instanceTemplate && element.instanceTemplate.selectionType === 'single') {
          applyDefaultValue(defaultValues, null, apiLookupPath, cardListPath, `${element.id}Selected`)
        }

        cardListPath.push(element.id)

        defaultValues.cardLists[element.id] = {}
        element.card.body.forEach(parseElement)

        cardListPath.pop()

        break
      case 'Input.DateTime':
        if (defaultValue !== undefined) {
          applyDefaultValue(defaultValues, defaultValue === '$TODAY' ? new Date() : defaultValue, apiLookupPath, cardListPath, element.id)
        }

        break
      case 'Input.Date':
        if (defaultValue !== undefined) {
          applyDefaultValue(defaultValues, defaultValue === '$TODAY' ? new Date() : defaultValue, apiLookupPath, cardListPath, element.id)
        }

        if (element.theme === 'GDS') {
          const defaultValue_ = {
            date: null,
            month: null,
            year: null
          }

          applyDefaultValue(defaultValues, defaultValue_, apiLookupPath, cardListPath, element.id + '_$DATE')
        }

        break
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
      case 'AdaptiveCard': {
        if (element.id && element.arrayPath) {
          if (element.selectionType === 'single' || element.selectionType === 'multi') {
            const defaultValue = element.selectionType === 'single' ? {} : []

            applyDefaultValue(defaultValues, defaultValue, apiLookupPath, cardListPath, element.id + 'Selected')
          }
        }
        break
      }
      case 'MarkupTable': {
        if (element.id) {
          if (element.selectionType === 'single' || element.selectionType === 'multi') {
            const defaultValue = element.selectionType === 'single' ? {} : []

            applyDefaultValue(defaultValues, defaultValue, apiLookupPath, cardListPath, element.id + 'Selected')
          }
        }
        break
      }
      case 'Table':
        if (element.selectionType) {
          applyDefaultValue(defaultValues, [], apiLookupPath, cardListPath, `${element.id}Selected`)
          // Apply on root as well
          applyDefaultValue(defaultValues, [], [], [], `${element.id}Selected`)
        }
        break
      case 'Stepper':
        applyDefaultValue(defaultValues, 0, apiLookupPath, cardListPath, `${element.id}Stepper`)

        element.steps.forEach(parseElement)
        break
      case 'TabSet':
        applyDefaultValue(defaultValues, 'tab-0', apiLookupPath, cardListPath, `${element.id}TabSet`)
        applyDefaultValue(defaultValues, element.tabs.map(t => t.showWhen), apiLookupPath, cardListPath, `${element.id}TabSetShowWhens`)

        element.tabs.forEach(parseElement)
        break
      case 'List':
        if (element.selectionType === 'single' || element.selectionType === 'multi') {
          const defaultValue = element.selectionType === 'single' ? {} : []

          applyDefaultValue(defaultValues, defaultValue, apiLookupPath, cardListPath, element.id)
        }
        break
      case 'Map':
      case 'Input.Map': {
        if (element.id) {
          applyDefaultValue(defaultValues, null, apiLookupPath, cardListPath, element.id + 'MapFlyTo')
        }

        const markers = element.markers ? [...element.markers] : []
        if (element.centre && element.centre.show) markers.push(element.centre)

        for (const [idx, m] of markers.entries()) {
          if (element.type === 'Input.Map') {
            const applyDefaultMapMarkerValue = (id, val) => {
              if (id !== undefined) {
                applyDefaultValue(defaultValues, val || 0, apiLookupPath, cardListPath, id)
              }
            }

            applyDefaultMapMarkerValue(m.latitude)
            applyDefaultMapMarkerValue(m.longitude)
            applyDefaultMapMarkerValue(m.x, 433938.00)
            applyDefaultMapMarkerValue(m.y, 288128.00)
          }

          const id_ = `${element.id}_MAP_PROMPT_${idx}`
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
      }
      case 'TextBlock':
        if (element.id && element.markdown) {
          const compiledMarkdown = marked(element.text, { sanitize: true })
          applyDefaultValue(defaultValues, compiledMarkdown, apiLookupPath, cardListPath, `${element.id}CompiledMarkdown`)
        }
        break
      case 'Tree':
        applyDefaultValue(defaultValues, element.nodes, apiLookupPath, cardListPath, element.id)

        if (element.selectionType) {
          const defaultValue = element.selectionType === 'single' ? {} : []
          applyDefaultValue(defaultValues, defaultValue, apiLookupPath, cardListPath, `${element.id}Selected`)
        }
    }
  }

  cardscript.body.forEach(parseElement)
  return defaultValues
}

function extractDefaultValue ({ type, value, isMultiSelect, editor }) {
  let defaultValue = value

  if (isMultiSelect) {
    let values = []

    if (Array.isArray(value)) {
      values = value
    } else if (typeof value === 'string') {
      values = value.split(',')
    }

    defaultValue = values
  }

  if ((defaultValue === undefined || defaultValue === null) && type === 'Input.Text' && editor) {
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

function getCurrentPosition (options = {}) {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options)
  })
}
